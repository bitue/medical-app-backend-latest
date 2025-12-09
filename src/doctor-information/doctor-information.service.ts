import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '@/doctor/doctor.entity';

import { DoctorInformation } from './doctor-information.entity';
import { CreateDoctorInformationDto } from './dtos/create-doctor-information';
import { UpdateDoctorInformationDto } from './dtos/update-doctor-information';

@Injectable()
export class DoctorInformationService {
  constructor(
    @InjectRepository(DoctorInformation)
    private readonly doctorInfoRepository: Repository<DoctorInformation>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  // Doctor submits info ONLY IF he is approved
  // async create(dto: CreateDoctorInformationDto) {
  //   console.log(dto);
  //   const doctor = await this.doctorRepository.findOne({
  //     where: { id: dto.doctorId },
  //   });

  //   if (!doctor) throw new NotFoundException('Doctor not found');
  //   if (!doctor.isApproved)
  //     throw new BadRequestException('Doctor is not approved by admin yet');

  //   const exists = await this.doctorInfoRepository.findOne({
  //     where: { doctor: { id: dto.doctorId } },
  //   });

  //   if (exists)
  //     throw new BadRequestException('Doctor information already exists');

  //   const info = this.doctorInfoRepository.create({
  //     doctor,
  //     paymentAmount: dto.paymentAmount,
  //     schedule: dto.schedule,
  //     adminApproval: false,
  //   });

  //   return this.doctorInfoRepository.save(info);
  // }

  async create(dto: CreateDoctorInformationDto) {
    try {
      console.log(dto);

      const doctor = await this.doctorRepository.findOne({
        where: { id: dto.doctorId },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      if (!doctor.isApproved) {
        throw new BadRequestException('Doctor is not approved by admin yet');
      }

      const exists = await this.doctorInfoRepository.findOne({
        where: { doctor: { id: dto.doctorId } },
      });

      if (exists) {
        throw new BadRequestException('Doctor information already exists');
      }

      const info = this.doctorInfoRepository.create({
        doctor,
        paymentAmount: dto.paymentAmount,
        schedule: dto.schedule,
        adminApproval: false,
      });

      return await this.doctorInfoRepository.save(info);
    } catch (error) {
      // Log full error in console for debugging
      console.error('Create Doctor Information Error:', error);

      // If NestJS error, rethrow it
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Any unexpected error
      throw new BadRequestException(
        error.message ||
          'Something went wrong while creating doctor information',
      );
    }
  }

  async update(id: number, dto: UpdateDoctorInformationDto) {
    const info = await this.doctorInfoRepository.findOne({ where: { id } });
    if (!info) throw new NotFoundException('DoctorInformation not found');

    Object.assign(info, dto);
    return this.doctorInfoRepository.save(info);
  }

  async findByDoctorId(doctorId: number) {
    return await this.doctorInfoRepository.findOne({
      where: { doctor: { id: doctorId } },
    });
  }

  // ADMIN APPROVES
  async approve(doctorInfoId: number) {
    const info = await this.doctorInfoRepository.findOne({
      where: { id: doctorInfoId },
    });
    if (!info) throw new NotFoundException('DoctorInformation not found');

    info.adminApproval = true;
    return this.doctorInfoRepository.save(info);
  }
}
