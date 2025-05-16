import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { HealthStatusCreateDto } from './dto/helth-status-create.dto';
import { Patient } from '@/patient/patient.entity';
import { HealthStatus } from './health-status.entity';

@Injectable()
export class HealthStatusService {
  constructor(
    @InjectRepository(HealthStatus)
    private readonly healthStatusRepository: Repository<HealthStatus>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  // async create(healthStatusData: HealthStatusCreateDto): Promise<HealthStatus> {
  //   const operationHistory =
  //     this.healthStatusRepository.create(healthStatusData);
  //   return this.healthStatusRepository.save(operationHistory);
  // }

  // async update(
  //   id: number,
  //   updateData: Partial<HealthStatusCreateDto>,
  // ): Promise<HealthStatus> {
  //   const healthStatus = await this.healthStatusRepository.findOne({
  //     where: { id },
  //   });
  //   if (!healthStatus) {
  //     throw new NotFoundException(`HealthStatus with id ${id} not found`);
  //   }

  //   // Merge existing entity with update data
  //   const updatedHealthStatus = this.healthStatusRepository.merge(
  //     healthStatus,
  //     updateData,
  //   );

  //   // Save updated entity
  //   return this.healthStatusRepository.save(updatedHealthStatus);
  // }

  async createOrUpdateHealthStatus(
    patientId: number,
    healthStatusData: HealthStatusCreateDto,
  ): Promise<HealthStatus> {
    // Find patient with healthStatus relation loaded
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ['healthStatus'],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.healthStatus) {
      // Update existing health status
      const updated = this.healthStatusRepository.merge(
        patient.healthStatus,
        healthStatusData,
      );
      return await this.healthStatusRepository.save(updated);
    } else {
      // Create new health status and associate it with patient
      const newHealthStatus =
        this.healthStatusRepository.create(healthStatusData);
      newHealthStatus.patient = patient;
      return await this.healthStatusRepository.save(newHealthStatus);
    }
  }
}
