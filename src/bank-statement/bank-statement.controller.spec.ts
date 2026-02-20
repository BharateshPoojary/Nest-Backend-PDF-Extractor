import { Test, TestingModule } from '@nestjs/testing';
import { BankStatementController } from './bank-statement.controller';
import { BankStatementService } from './bank-statement.service';
import { BadRequestException } from '@nestjs/common';

describe('BankStatementController', () => {
  let controller: BankStatementController;
  let bankService: BankStatementService;

  // Mock the service with jest functions
  const mockBankStatementService = {
    handleUploadAndDocExtraction: jest.fn(),
    handleNotification: jest.fn(),
    getByJobId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankStatementController],
      providers: [
        {
          provide: BankStatementService,
          useValue: mockBankStatementService,
        },
      ],
    }).compile();

    controller = module.get<BankStatementController>(BankStatementController);
    bankService = module.get<BankStatementService>(BankStatementService);
  });

  // Reset mocks after each test to avoid interference
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── getIndexPage ────────────────────────────────────────────────
  describe('getIndexPage', () => {
    it('should return { message: Hello }', () => {
      const result = controller.getIndexPage();
      expect(result).toEqual({ message: 'Hello' });
    });
  });

  // ─── uploadFile ──────────────────────────────────────────────────
  describe('uploadFile', () => {
    it('should call handleUploadAndDocExtraction with file and return result', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/tmp/uploads/test.pdf',
      } as Express.Multer.File;

      const mockResponse = {
        message: 'File uploaded successfully',
        jobId: 'job-123',
        s3Key: 's3/test.pdf',
      };

      mockBankStatementService.handleUploadAndDocExtraction.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.uploadFile(mockFile);

      expect(bankService.handleUploadAndDocExtraction).toHaveBeenCalledWith(
        mockFile,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw if service throws', async () => {
      const mockFile = { originalname: 'test.pdf' } as Express.Multer.File;

      mockBankStatementService.handleUploadAndDocExtraction.mockRejectedValue(
        new BadRequestException('Upload failed'),
      );

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── handleNotification ──────────────────────────────────────────
  describe('handleNotification', () => {
    it('should call handleNotification with body and return result', async () => {
      const mockBody = { jobId: 'job-123', status: 'completed' };
      const mockResponse = { success: true };

      mockBankStatementService.handleNotification.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.handleNotification(mockBody);

      expect(bankService.handleNotification).toHaveBeenCalledWith(mockBody);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException when body is empty', async () => {
      expect(() => controller.handleNotification({})).toThrow(
        BadRequestException,
      );
      // Service should never be called with empty body
      expect(bankService.handleNotification).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when body is null', async () => {
      expect(() => controller.handleNotification(null)).toThrow(
        BadRequestException,
      );
      expect(bankService.handleNotification).not.toHaveBeenCalled();
    });
  });

  // ─── getDocById ──────────────────────────────────────────────────
  describe('getDocById', () => {
    it('should call getByJobId with jobId and return result', async () => {
      const mockJobId = 'job-123';
      const mockResponse = { jobId: mockJobId, status: 'completed', data: {} };

      mockBankStatementService.getByJobId.mockResolvedValue(mockResponse);

      const result = await controller.getDocById(mockJobId);

      expect(bankService.getByJobId).toHaveBeenCalledWith(mockJobId);
      expect(result).toEqual(mockResponse);
    });

    it('should throw if jobId does not exist', async () => {
      mockBankStatementService.getByJobId.mockRejectedValue(
        new BadRequestException('Job not found'),
      );

      await expect(controller.getDocById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
