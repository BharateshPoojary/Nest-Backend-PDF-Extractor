import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import {
  TextractClient,
  type TextractClientConfig,
} from '@aws-sdk/client-textract';
import dotenv from 'dotenv';
dotenv.config();
const textractconfig: TextractClientConfig = {
  region: process.env.REGION as string,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_KEY as string,
  },
};
const s3config: S3ClientConfig = {
  region: process.env.REGION as string,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_KEY as string,
  },
};

const textractClient = new TextractClient(textractconfig);
const s3Client = new S3Client(s3config);
export { textractClient, s3Client };
