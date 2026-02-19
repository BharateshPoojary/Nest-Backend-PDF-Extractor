import { Test, TestingModule } from '@nestjs/testing';

import { BankStatementController } from './bank-statement.controller';

import { BankStatementService } from './bank-statement.service';
import { BankStatementModule } from './bank-statement.module';

describe('BankStatementController', () => {
  let bankstmtController: BankStatementController;

  beforeEach(async () => {
    const bankstmtmodule: TestingModule = await Test.createTestingModule({
      controllers: [BankStatementController],
      providers: [BankStatementService],
    }).compile();
    bankstmtController = bankstmtmodule.get<BankStatementController>(
      BankStatementController,
    );
  });
  describe('test', () => {
    it('should resturn hello', () => {
      expect(bankstmtController.getIndexPage()).toEqual({ message: 'Hello' });
    });
  });
});
