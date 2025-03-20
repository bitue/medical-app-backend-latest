import { Test, TestingModule } from '@nestjs/testing';
import { CurrentMedicationService } from './current-medication.service';

describe('CurrentMedicationService', () => {
  let service: CurrentMedicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrentMedicationService],
    }).compile();

    service = module.get<CurrentMedicationService>(CurrentMedicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
