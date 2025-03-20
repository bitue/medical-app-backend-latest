import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './prescription.entity';
import { Repository } from 'typeorm';
import { CreatePrescriptionDto } from './dtos/prescription-create.dto';

@Injectable()
export class PrescriptionService {
    constructor(
        @InjectRepository(Prescription)
        private readonly prescriptionRepository: Repository<Prescription>,
      ) {}
    
      async create(prescriptionData: CreatePrescriptionDto): Promise<Prescription> {
        const prescription = this.prescriptionRepository.create(prescriptionData);
        return this.prescriptionRepository.save(prescription);
      }

      async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
        
        const prescriptions = await this.prescriptionRepository.find({
          where: { patient: { id: patientId } },
          relations: ['doctor', 'doctor.user', 'patient', 'patient.user'], // Load patient and its user details
          order: { prescriptionDate: 'DESC' },
        });
        
        if (!prescriptions.length) {
          throw new NotFoundException(`No prescriptions found for patient with ID ${patientId}`);
        }
    
        return prescriptions;
      }
}
