import { Module } from '@nestjs/common';
import { AWSClientService } from './aws.service';
import { ConfigModule } from '@nestjs/config';

@Module({

  providers: [AWSClientService],
  exports: [AWSClientService],
})
export class AWSModule {}
