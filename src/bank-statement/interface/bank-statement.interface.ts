import { Transaction } from "src/transaction/interface/transaction.interface";

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
