export const ExtractionTemplate = (rawText: string, fileName: string) => `
You are a bank statement parser. Extract structured data from the following bank statement text.

IMPORTANT INSTRUCTIONS:
1. Identify all bank accounts in the document
2. If multiple accounts exist, extract each separately
3. Normalize inconsistent labels (e.g., "Acc No", "Account #", "A/C No" → "accountNumber")
4. Extract ALL transactions with proper date parsing
5. Handle multiple date formats (DD/MM/YYYY, MM/DD/YYYY, etc.)
6. Parse monetary values correctly (handle commas, decimals, currency symbols)
7. Distinguish between debit and credit columns
8. Calculate running balance if not provided

OUTPUT FORMAT:
Return ONLY a valid JSON array with this exact schema (no markdown, no explanation):

[
  {
    "fileName": "${fileName}",
    "bankName": "string",
    "accountHolderName": "string",
    "accountNumber": "string",
    "accountType": "Savings|Current|null",
    "currency": "INR|USD|EUR etc",
    "statementStartDate": "YYYY-MM-DD",
    "statementEndDate": "YYYY-MM-DD",
    "openingBalance": number,
    "closingBalance": number,
    "transactions": [
      {
        "date": "YYYY-MM-DD",
        "description": "string",
        "debitAmount": number or null,
        "creditAmount": number or null,
        "runningBalance": number
      }
    ]
  }
]

RULES:
- Return empty array [] if no bank statement found
- All dates must be in YYYY-MM-DD format
- All amounts must be numbers (no strings, no currency symbols)
- If debit/credit cannot be determined, put amount in creditAmount for deposits, debitAmount for withdrawals
- Preserve all transaction descriptions exactly as they appear
- If opening/closing balance not found, calculate from transactions

RAW BANK STATEMENT TEXT:
${rawText}
`;
