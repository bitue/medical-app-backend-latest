import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Education } from './education.entity';
import { CreateEducationDto } from './dtos/create-education.dto';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(Education)
    private readonly educationRepository: Repository<Education>,
  ) {}

  async create(educationData: CreateEducationDto): Promise<Education> {
    const education = this.educationRepository.create(educationData);
    return this.educationRepository.save(education);
  }

  async createMany(educations: CreateEducationDto[]): Promise<Education[]> {
    const edu = this.educationRepository.create(educations);
    return this.educationRepository.save(edu);
  }
}
