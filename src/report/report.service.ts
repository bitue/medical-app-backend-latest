import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/report-create.dto';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
      ) {}

      async create(reportData: CreateReportDto): Promise<Report> {
        const prescription = this.reportRepository.create(reportData);
        return this.reportRepository.save(prescription);
      }

      async getReportsByPatient(patientId: number): Promise<Report[]> {
        
        const reports = await this.reportRepository.find({
          where: { patient: { id: patientId } },
          relations: ['patient', 'patient.user'], // Load patient and its user details
          order: { reportDate: 'DESC' },
        });
        
        if (!reports.length) {
          throw new NotFoundException(`No reports found for patient with ID ${patientId}`);
        }
    
        return reports;
      }
}
