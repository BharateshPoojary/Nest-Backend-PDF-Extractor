export interface Transaction {
  date: string;
  description: string;
  debitAmount: number | null;
  creditAmount: number | null;
  runningBalance: number;
}
