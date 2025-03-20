import { Test, TestingModule } from '@nestjs/testing';
import { OperationHistoryService } from './operation-history.service';

describe('OperationHistoryService', () => {
  let service: OperationHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperationHistoryService],
    }).compile();

    service = module.get<OperationHistoryService>(OperationHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
