import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BankStatement,
  BankStatementSchema,
} from './schema/bank-statement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankStatement.name, schema: BankStatementSchema },
    ]),
  ],
  providers: [],
  controllers: [],
})
export class BankStatementModule {}
