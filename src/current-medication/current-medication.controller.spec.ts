import { Test, TestingModule } from '@nestjs/testing';
import { CurrentMedicationController } from './current-medication.controller';

describe('CurrentMedicationController', () => {
  let controller: CurrentMedicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentMedicationController],
    }).compile();

    controller = module.get<CurrentMedicationController>(CurrentMedicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
