import { BankStatement } from "src/bank-statement/interface/bank-statement.interface";




export interface BankStatementDocument extends Document {
  jobId: string;
  data: BankStatement[];
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}
