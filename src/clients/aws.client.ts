import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import {
  TextractClient,
  type TextractClientConfig,
} from '@aws-sdk/client-textract';

export class AWSClient {
  private static instance: AWSClient;
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

  static getInstance(): AWSClient {
    if (!AWSClient.instance) {
      AWSClient.instance = new AWSClient();
    }
    return AWSClient.instance;
  }

  get s3Client(): S3Client {
    return this._s3Client;
  }

  get textractClient(): TextractClient {
    return this._textractClient;
  }
}
