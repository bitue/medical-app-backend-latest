import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './prescription.entity';
import { Repository } from 'typeorm';
import { CreatePrescriptionDto } from './dtos/prescription-create.dto';
import { S3Service } from '@/s3/s3.service';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    private readonly s3Service: S3Service,
  ) { }

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

    // Generate signed URLs for each prescription
    const prescriptionsWithSignedUrls = await Promise.all(
      prescriptions.map(async (p) => {
        if (p.docPath) {
          p.docPath = await this.s3Service.getPresignedUrl(p.docPath);
        }
        return p;
      })
    );

    return prescriptionsWithSignedUrls;
  }
}
