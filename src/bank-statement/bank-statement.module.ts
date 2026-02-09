import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BankStatementService } from './bank-statement.service';
import { BankStatementController } from './bank-statement.controller';
import {
  ExtractedDocument,
  ExtractedDocumentSchema,
} from './schema/bank-statement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExtractedDocument.name, schema: ExtractedDocumentSchema },
    ]),
  ],
  providers: [BankStatementService],
  controllers: [BankStatementController],
})
export class BankStatementModule {}
