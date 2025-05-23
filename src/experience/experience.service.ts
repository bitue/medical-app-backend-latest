import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEducationDto } from 'src/education/dtos/create-education.dto';
import { Education } from 'src/education/education.entity';
import { Repository } from 'typeorm';
import { Experience } from './experience.entity';
import { CreateExperienceDto } from './dtos/create-experience.dto';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
  ) {}

  async create(experienceData: CreateExperienceDto): Promise<Experience> {
    const experience = this.experienceRepository.create(experienceData);
    return this.experienceRepository.save(experience);
  }

  async createMany(experiences: CreateExperienceDto[]): Promise<Experience[]> {
    const exp = this.experienceRepository.create(experiences);
    return this.experienceRepository.save(exp);
  }
}
