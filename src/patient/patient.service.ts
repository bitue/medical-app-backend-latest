import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dtos/create-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: Partial<CreatePatientDto>): Promise<Patient> {
    const patient = this.patientRepository.create();
    patient.user = createPatientDto.user;
    if (createPatientDto.currentMedication) {
      patient.currentMedications = [createPatientDto.currentMedication];
    }
    if (createPatientDto.operationHistory) {
      patient.operationHistories = [createPatientDto.operationHistory];
    }
    if (createPatientDto.healthStatus) {
      patient.healthStatus = createPatientDto.healthStatus;
    }
    return this.patientRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.currentMedications', 'currentMedications')
      .leftJoinAndSelect('patient.operationHistories', 'operationHistories')
      .leftJoinAndSelect('patient.healthStatus', 'healthStatus')
      .leftJoin('patient.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.email'])
      .getMany();
  }

  async findByUserId(userId: number): Promise<Patient | null> {
    return this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'user',
        'currentMedications',
        'operationHistories',
        'healthStatus',
      ],
    });
  }
  async findOne(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }

  async update(id: number, patientData: Partial<Patient>): Promise<Patient> {
    const patient = await this.findOne(id);
    if (!patient) {
      throw new BadRequestException('Patient Not Found!');
    }
    Object.assign(patient, patientData);
    return this.patientRepository.save(patient);
  }

  async findPatientByEmail(email: string): Promise<Patient> {
    const patient = await this.patientRepository
      .createQueryBuilder('patient')
      .innerJoinAndSelect('patient.user', 'user') // Join User table
      .leftJoinAndSelect('patient.currentMedications', 'currentMedications')
      .leftJoinAndSelect('patient.operationHistories', 'operationHistories')
      .leftJoinAndSelect('patient.healthStatus', 'healthStatus')
      .leftJoinAndSelect('patient.prescriptions', 'prescriptions')
      .leftJoinAndSelect('patient.reports', 'reports')
      .leftJoinAndSelect('patient.appointments', 'appointments')
      .where('user.email = :email', { email }) // Filter by user email
      .getOne();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
}
