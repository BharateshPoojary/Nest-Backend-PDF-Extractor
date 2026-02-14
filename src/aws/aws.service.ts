import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TextractClient, TextractClientConfig } from '@aws-sdk/client-textract';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

@Injectable()
export class AWSClientService {
  private readonly s3Client: S3Client;
  private readonly textractClient: TextractClient;

  constructor(private configService: ConfigService) {
    const credentials = {
      accessKeyId: this.configService.get<string>('ACCESS_KEY') as string,
      secretAccessKey: this.configService.get<string>('SECRET_KEY') as string,
    };
    const region = this.configService.get<string>('REGION');
    const s3Config: S3ClientConfig = { region, credentials };
    const textractConfig: TextractClientConfig = { region, credentials };
    this.s3Client = new S3Client(s3Config);
    this.textractClient = new TextractClient(textractConfig);
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  getTextractClient(): TextractClient {
    return this.textractClient;
  }
}
