import { Module } from '@nestjs/common';
import { AIClientService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({

  providers: [AIClientService],
  exports: [AIClientService],
})
export class AIModule {}
