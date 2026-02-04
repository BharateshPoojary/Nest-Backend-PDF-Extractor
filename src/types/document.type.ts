export interface BankStatement {
  fileName: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  accountType?: string;
  currency: string;
  statementStartDate: string;
  statementEndDate: string;
  openingBalance: number;
  closingBalance: number;
  transactions: Transaction[];
}

export interface Transaction {
  date: string;
  description: string;
  debitAmount: number | null;
  creditAmount: number | null;
  runningBalance: number;
}

export interface BankStatementDocument extends Document {
  jobId: string;
  data: BankStatement[];
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}
