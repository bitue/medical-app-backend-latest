import { Test, TestingModule } from '@nestjs/testing';
import { OperationHistoryController } from './operation-history.controller';

describe('OperationHistoryController', () => {
  let controller: OperationHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationHistoryController],
    }).compile();

    controller = module.get<OperationHistoryController>(OperationHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
