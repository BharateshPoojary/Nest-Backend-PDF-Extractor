import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import {
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
  type StartDocumentTextDetectionCommandInput,
  type GetDocumentTextDetectionCommandOutput,
  TextractClient,
  TextractClientConfig,
} from '@aws-sdk/client-textract';
import {
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';

import {
  BankStatement,
  ExtractedDocument,
} from './schema/bank-statement.schema';
import { ExtractionTemplate } from 'src/lib/prompt-template';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
class AIClientService {
  private static instance: AIClientService;
  private _client: GoogleGenAI;

  private constructor() {
    this._client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  static getInstance(): AIClientService {
    if (!AIClientService.instance) {
      AIClientService.instance = new AIClientService();
    }
    return AIClientService.instance;
  }

  get client(): GoogleGenAI {
    return this._client;
  }
}

class AWSClientService {
  private static instance: AWSClientService;
  private _s3Client: S3Client;
  private _textractClient: TextractClient;

  private constructor() {
    const credentials = {
      accessKeyId: process.env.ACCESS_KEY as string,
      secretAccessKey: process.env.SECRET_KEY as string,
    };
    const region = process.env.REGION as string;

    const s3Config: S3ClientConfig = { region, credentials };
    const textractConfig: TextractClientConfig = { region, credentials };

    this._s3Client = new S3Client(s3Config);
    this._textractClient = new TextractClient(textractConfig);
  }

  static getInstance(): AWSClientService {
    if (!AWSClientService.instance) {
      AWSClientService.instance = new AWSClientService();
    }
    return AWSClientService.instance;
  }

  get s3Client(): S3Client {
    return this._s3Client;
  }

  get textractClient(): TextractClient {
    return this._textractClient;
  }
}
@Injectable()
export class BankStatementService {
  constructor(
    @InjectModel(ExtractedDocument.name)
    private ExtractedDocumentModal: Model<ExtractedDocument>,
    private readonly configService: ConfigService,
  ) {}

  async handleUploadAndDocExtraction(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const filePath = file.path;
      const fileBuffer = fs.readFileSync(filePath);

      const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
      const s3Key = `uploads/${Date.now()}~${file.originalname}`;
      console.log('File Buffer', fileBuffer);
      const s3Params: PutObjectCommandInput = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.mimetype,
      };

      const s3Command = new PutObjectCommand(s3Params);
      await AWSClientService.getInstance().s3Client.send(s3Command);
      console.log(`File uploaded to S3: ${s3Key}`);

      const textractParams: StartDocumentTextDetectionCommandInput = {
        DocumentLocation: {
          S3Object: {
            Bucket: bucketName,
            Name: s3Key,
          },
        },
        NotificationChannel: {
          RoleArn: this.configService.get<string>('ROLE_ARN'),
          SNSTopicArn: this.configService.get<string>('SNS_TOPIC_ARN'),
        },
      };

      const textractCommand = new StartDocumentTextDetectionCommand(
        textractParams,
      );
      const data =
        await AWSClientService.getInstance().textractClient.send(
          textractCommand,
        );
      console.log('Textract job started:', data.JobId);

      if (data.JobId) {
        console.log('Iam here at one');
        await this.ExtractedDocumentModal.create({
          jobId: data.JobId,
          data: [],
          status: 'PROCESSING',
        });
      } else {
        throw new Error('Failed to get job Id');
      }

      // Delete local file after uploading to S3
      fs.unlinkSync(filePath);

      return {
        message: 'File uploaded and processing started',
        jobId: data.JobId,
        s3Key: s3Key,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Error Occurred',
      );
    }
  }

  async handleNotification(body: any): Promise<string> {
    try {
      // Parse the body if it's a string
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      // Handle subscription confirmation
      if (body.Type === 'SubscriptionConfirmation') {
        const subscribeURL = body.SubscribeURL;

        // Visit the URL to confirm
        const response = await fetch(subscribeURL);
        await response.text();

        return 'Subscription confirmed';
      }

      // Handle notifications
      if (body.Type === 'Notification') {
        const message = JSON.parse(body.Message);
        console.log('Textract notification:', message);

        if (message.Status === 'SUCCEEDED') {
          const fileName =
            message.DocumentLocation.S3ObjectName.split('~').pop();

          const data = await this.getDocText(message.JobId, fileName);
          await this.ExtractedDocumentModal.findOneAndUpdate(
            { jobId: message.JobId },
            {
              data,
              status: 'COMPLETED',
            },
            { new: true },
          );

          return 'Message received';
        } else if (message.Status === 'FAILED') {
          await this.ExtractedDocumentModal.findOneAndUpdate(
            { jobId: message.JobId },
            { status: 'FAILED' },
          );
          throw new InternalServerErrorException(
            'Error Extracting text from pdf',
          );
        }
      }

      return 'OK';
    } catch (error) {
      console.error('Webhook error:', error);
      throw new InternalServerErrorException('Error processing notification');
    }
  }

  private async getDocText(jobId: string, fileName: string) {
    let allBlocks: any[] = [];
    let nextToken: string | undefined = undefined;
    let pageCount = 0;

    // Keep fetching until there's no NextToken
    do {
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);

      const command = new GetDocumentTextDetectionCommand({
        JobId: jobId,
        MaxResults: 1000,
        NextToken: nextToken,
      });

      const response: GetDocumentTextDetectionCommandOutput =
        await AWSClientService.getInstance().textractClient.send(command);

      if (response.JobStatus === 'FAILED') {
        await this.ExtractedDocumentModal.findOneAndUpdate(
          { jobId },
          { status: 'FAILED' },
        );
        throw new Error('Error detecting text');
      }

      // Collect blocks from this page
      if (response.Blocks) {
        allBlocks.push(...response.Blocks);
      }

      // Get the next token for pagination
      nextToken = response.NextToken;

      console.log(
        `Page ${pageCount}: Got ${
          response.Blocks?.length || 0
        } blocks. NextToken: ${nextToken ? 'exists' : 'none'}`,
      );
    } while (nextToken);

    console.log(
      `Total blocks retrieved: ${allBlocks.length} across ${pageCount} pages`,
    );

    // Extract text from all blocks
    const text = allBlocks
      .filter((block) => block.BlockType === 'LINE')
      .map((block) => block.Text)
      .join('\n');

    console.log(`Total text length: ${text.length} characters`);

    const resultantData = await this.normalizeWithAI(
      text ?? '',
      fileName,
      jobId,
    );

    return resultantData;
  }

  private async normalizeWithAI(
    rawText: string,
    fileName: string,
    jobId: string,
  ): Promise<BankStatement[]> {
    const prompt = ExtractionTemplate(rawText, fileName);

    try {
      console.log('Raw Text', rawText);

      const result =
        await AIClientService.getInstance().client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
      const response = result.text;
      // console.log("Response", response);
      // Remove markdown code blocks if present
      const cleanedResponse = response
        ?.replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedResponse ?? '');

      // Validate structure
      if (!Array.isArray(parsed) || parsed.length === 0) {
        await this.ExtractedDocumentModal.findOneAndUpdate(
          { jobId },
          { status: 'FAILED' },
        );
        throw new Error('AI response is not an array');
      }
      console.log('parsed', parsed);
      return parsed as BankStatement[];
    } catch (error) {
      console.error('AI normalization error:', error);
      throw new Error('Failed to normalize bank statement with AI');
    }
  }

  async getByJobId(jobId: string) {
    console.log('jobId', jobId);
    if (!jobId) {
      throw new BadRequestException('Please send a jobId');
    }

    const document = await this.ExtractedDocumentModal.findOne({ jobId });

    if (!document) {
      throw new NotFoundException('Job not found');
    }

    return {
      jobId: document.jobId,
      status: document.status,
      data: document.data,
    };
  }
}
