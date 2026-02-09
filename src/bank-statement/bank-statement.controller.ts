import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { BankStatementService } from './bank-statement.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
@Controller()
export class BankStatementController {
  constructor(private readonly BankService: BankStatementService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
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
  handleNotification(@Req() req: Request) {
    return this.BankService.handleNotification(req);
  }
  @Get(':jobId')
  getDocById(@Param('jobId') jobId: string) {
    return this.BankService.getByJobId(jobId);
  }
}
