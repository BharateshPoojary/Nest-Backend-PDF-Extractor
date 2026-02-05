import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({
    required: true,
  })
  date: string;

  @Prop({
    required: true,
  })
  description: string;

  @Prop({
    required: true,
  })
  debitAmount: number;

  @Prop({
    required: true,
  })
  creditAmount: number;

  @Prop({
    required: true,
  })
  runningBalance: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
