import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrentMedication } from './current-medication.entity';
import { Repository } from 'typeorm';
import { CreateCurrentMedicationDto } from './dtos/create-current-medication.dto';
import { DoctorService } from 'src/doctor/doctor.service';
import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';
import { Appointment } from '@/appointment/appointment.entity';

// export interface ICurrentMedication {
//   doctor: Doctor; // Store full Doctor object
//   startDate: Date;
//   endDate: Date;
//   doses: string;
//   patient: Patient;
//   isRunning: boolean;
// }

@Injectable()
export class CurrentMedicationService {
  constructor(
    @InjectRepository(CurrentMedication)
    private readonly currentMedicationRepository: Repository<CurrentMedication>,
  ) {}

  async create(
    currentMedicationData: CreateCurrentMedicationDto,
  ): Promise<CurrentMedication> {
    const currentMedication = this.currentMedicationRepository.create(
      currentMedicationData,
    );
    return await this.currentMedicationRepository.save(currentMedication);
  }

  async getMedicationsByPatientId(patientId: number) {
    const meds = await this.currentMedicationRepository.find({
      where: { patient: { id: patientId } },
      relations: ['appointment'],
    });

    // Map to only include appointment id and date if exists
    return meds.map((med) => ({
      id: med.id,
      doses: med.doses,
      startDate: med.startDate,
      endDate: med.endDate,
      isRunning: med.isRunning,
      createdAt: med.createdAt,
      updatedAt: med.updatedAt,
      appointment: med.appointment
        ? {
            id: med.appointment.id,
            accessTime: med.appointment.accessTime,
            createdAt: med.appointment.createdAt,
            updatedAt: med.appointment.updatedAt,
          }
        : null,
    }));
  }

  async createAll(
    currentMedicationData: CreateCurrentMedicationDto[],
  ): Promise<CurrentMedication[]> {
    const currentMedication = this.currentMedicationRepository.create(
      currentMedicationData,
    );
    return await this.currentMedicationRepository.save(currentMedication);
  }
}
