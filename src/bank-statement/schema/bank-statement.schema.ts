import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Transaction, TransactionSchema } from '../../transaction/schema/transaction.schema';

export type BankStatementDocument = HydratedDocument<BankStatement>;

@Schema()
export class BankStatement {
  @Prop({
    required: true,
  })
  fileName: string;

  @Prop({
    required: true,
  })
  bankName: string;

  @Prop({
    required: true,
  })
  accountHolderName: string;

  @Prop({
    required: true,
  })
  accountNumber: string;

  @Prop({
    required: true,
  })
  accountType: string;

  @Prop({
    required: true,
    default: 'INR',
  })
  currency: string;

  @Prop({
    required: true,
  })
  statementStartDate: string;

  @Prop({
    required: true,
  })
  statementEndDate: string;

  @Prop({
    required: true,
  })
  openingBalance: number;

  @Prop({
    required: true,
  })
  closingBalance: number;

  @Prop({
    required: true,
    type: [TransactionSchema],
  })
  transactions: Transaction[];
}

export const BankStatementSchema = SchemaFactory.createForClass(BankStatement);

   