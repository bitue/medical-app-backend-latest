import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dtos/create-users.dto';
import { UpdateUserDto } from './dtos/update-users.dto';
import { S3Service } from '@/s3/s3.service';
import { Patient } from '@/patient/patient.entity';
import { Doctor } from '@/doctor/doctor.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private s3Service: S3Service,
    private dataSource: DataSource,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findOne(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && user.profileImage) {
      user.profileImage = await this.s3Service.getPresignedUrl(user.profileImage as string);
    }
    return user;
  }

  async update(email: string, userData: Partial<UpdateUserDto>): Promise<User> {
    await this.usersRepository.update({ email }, userData);
    return this.findOne(email);
  }

  async deleteAccount(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // 1. Delete Profile Image
      if (user.profileImage) {
        await this.s3Service.deleteFile(user.profileImage as string);
      }

      // 2. PATIENT FILES
      const patientRepo = this.dataSource.getRepository(Patient);
      const patient = await patientRepo.findOne({
        where: { user: { id } },
        relations: ['prescriptions', 'reports'],
      });

      if (patient) {
        if (patient.prescriptions) {
          for (const prescription of patient.prescriptions) {
            if (prescription.docPath) {
              await this.s3Service.deleteFile(prescription.docPath);
            }
          }
        }
        if (patient.reports) {
          for (const report of patient.reports) {
            if (report.docPath) {
              await this.s3Service.deleteFile(report.docPath);
            }
          }
        }
      }

      // 3. DOCTOR FILES
      const doctorRepo = this.dataSource.getRepository(Doctor);
      const doctor = await doctorRepo.findOne({
        where: { user: { id } },
        relations: ['prescriptions'],
      });

      if (doctor) {
        if (doctor.prescriptions) {
          for (const prescription of doctor.prescriptions) {
            if (prescription.docPath) {
              await this.s3Service.deleteFile(prescription.docPath);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error deleting S3 files', error);
      // Continue to DB delete even if S3 fails
    }

    // 4. Delete User (DB Cascade should handle Patient, Doctor, and their children)
    await this.usersRepository.delete(id);
  }

  async delete(id: number): Promise<void> {
    await this.deleteAccount(id);
  }
}
