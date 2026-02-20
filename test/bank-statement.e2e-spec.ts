import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import * as path from 'path';
import { AIModule } from '../src/ai/ai.module';
import { AWSModule } from '../src/aws/aws.module';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import {
  ExtractedDocument,
  ExtractedDocumentSchema,
} from 'src/bank-statement/schema/bank-statement.schema';
import { Model } from 'mongoose';

describe('BankStatementController (e2e)', () => {
  let app: INestApplication<App>;
  let extractedDocModel: Model<ExtractedDocument>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([
          { name: ExtractedDocument.name, schema: ExtractedDocumentSchema },
        ]),
        AIModule,
        AWSModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    extractedDocModel = moduleFixture.get<Model<ExtractedDocument>>(
      getModelToken(ExtractedDocument.name),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── GET /test ───────────────────────────────────────────────────
  describe('GET /test', () => {
    it('should return Hello message', () => {
      return request(app.getHttpServer())
        .get('/test')
        .expect(200)
        .expect({ message: 'Hello' });
    });
  });

  // ─── POST /upload ─────────────────────────────────────────────────
  describe('POST /upload', () => {
    it('should upload a valid PDF file and return jobId and s3Key', () => {
      return request(app.getHttpServer())
        .post('/upload')
        .attach('file', path.resolve(__dirname, './fixtures/test.pdf')) // place a sample pdf in test/fixtures/
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('jobId');
          expect(res.body).toHaveProperty('s3Key');
        });
    });

    it('should reject non-PDF files with 400', () => {
      return request(app.getHttpServer())
        .post('/upload')
        .attach('file', path.resolve(__dirname, './fixtures/test.txt')) // place a sample txt in test/fixtures/
        .expect(400);
    });

    it('should return 400 if no file is attached', () => {
      return request(app.getHttpServer()).post('/upload').expect(400);
    });
  });

  // ─── POST /notify ─────────────────────────────────────────────────
  describe('POST /notify', () => {
    it('should handle a valid notification body', () => {
      const mockBody = { jobId: 'job-123', status: 'completed' };

      return request(app.getHttpServer())
        .post('/notify')
        .send(mockBody)
        .expect(201)
        .expect((res) => {
          expect(res.body).toBeDefined();
        });
    });

    it('should return 400 if body is empty', () => {
      return request(app.getHttpServer())
        .post('/notify')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Request body is empty');
        });
    });
  });

  // ─── GET /:jobId ──────────────────────────────────────────────────
 describe('GET /:jobId', () => {
  let seededJobId: string;

  beforeEach(async () => {
    const model = app.get<Model<ExtractedDocument>>(
      getModelToken(ExtractedDocument.name),
    );

    const doc = await model.create({
      jobId: 'job-123',
      status: 'completed',
      data: {},
    });

    seededJobId = doc.jobId;
  });

  afterEach(async () => {
    const model = app.get<Model<ExtractedDocument>>(
      getModelToken(ExtractedDocument.name),
    );
    await model.deleteMany({});
  });

  it('should return document for a valid jobId', () => {
    return request(app.getHttpServer())
      .get(`/${seededJobId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('jobId', seededJobId);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('data');
      });
  });

  it('should return 404 for a non-existent jobId', () => {
    return request(app.getHttpServer())
      .get('/non-existent-job-id')
      .expect(404)                                   // ✅ NotFoundException = 404
      .expect((res) => {
        expect(res.body.message).toBe('Job not found');
      });
  });
});
});
