import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialty } from './entities/specialty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  create(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    const spec = this.specialtyRepository.create(createSpecialtyDto);
    return this.specialtyRepository.save(spec);
  }

  createAll(createSpecialDtos: CreateSpecialtyDto[]) {
    const specAll = this.specialtyRepository.create(createSpecialDtos);
    return this.specialtyRepository.save(specAll);
  }

  findAll(): Promise<Specialty[]> {
    return this.specialtyRepository.find();
  }

  findOne(id: number): Promise<Specialty | null> {
    return this.specialtyRepository.findOne({ where: { id } });
  }

  async update(id: number, updateSpecialtyDto: UpdateSpecialtyDto) {
    const spec = await this.findOne(id);

    if (!spec) throw new Error('Specialty not found');

    const saveSpecial = this.specialtyRepository.merge(
      spec,
      updateSpecialtyDto,
    );

    return this.specialtyRepository.save(saveSpecial);
  }

  async removeById(id: number): Promise<Specialty> {
    const specialty = await this.specialtyRepository.findOne({ where: { id } });
    if (!specialty) {
      throw new Error('Specialty not found');
    }
    return this.specialtyRepository.remove(specialty);
  }
}
