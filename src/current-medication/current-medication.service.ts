import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrentMedication } from './current-medication.entity';
import { Repository } from 'typeorm';
import { CreateCurrentMedicationDto } from './dtos/create-current-medication.dto';
import { DoctorService } from 'src/doctor/doctor.service';
import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';

export interface ICurrentMedication {
  doctor: Doctor;    // Store full Doctor object
  startDate: Date;
  endDate: Date;
  doses: string[];
}

@Injectable()
export class CurrentMedicationService {
    constructor(
        @InjectRepository(CurrentMedication)
        private readonly currentMedicationRepository: Repository<CurrentMedication>
      ) {}

      async create(currentMedicationData: ICurrentMedication): Promise<CurrentMedication> {
        const currentMedication = this.currentMedicationRepository.create(currentMedicationData);
        return this.currentMedicationRepository.save(currentMedication);
      }
}
