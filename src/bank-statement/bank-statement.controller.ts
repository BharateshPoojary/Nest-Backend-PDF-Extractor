import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  type RawBodyRequest,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { BankStatementService } from './bank-statement.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller()
export class BankStatementController {
  constructor(private readonly BankService: BankStatementService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp/uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(pdf)$/)) {
          return callback(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{
    message: string;
    jobId: string;
    s3Key: string;
  }> {
    return this.BankService.handleUploadAndDocExtraction(file);
  }




  @Post('notify')
  async handleNotification(@Req() req: RawBodyRequest<Request>) {
    // Parse the raw body as text, then parse as JSON
    const rawBody = req.rawBody?.toString('utf-8') || req.body;
    
    let body;
    if (typeof rawBody === 'string') {
      try {
        body = JSON.parse(rawBody);
      } catch (e) {
        body = rawBody;
      }
    } else {
      body = rawBody;
    }

    console.log('Parsed body:', body);
    
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Request body is empty');
    }
    
    return this.BankService.handleNotification(body);
  }

  @Get('bank')
  getIndexPage() {
    return { message: 'Hello' };
  }
  @Get(':jobId')
  getDocById(@Param('jobId') jobId: string) {
    return this.BankService.getByJobId(jobId);
  }
}
