import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { User } from 'src/users/users.entity';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { CallGateway } from '@/call/call.gateway';
import { Specialty } from '@/specialties/entities/specialty.entity';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    private callGateway: CallGateway,

    @InjectRepository(Specialty)
    private readonly specialRepository: Repository<Specialty>,
  ) {}

  async create(createDoctorDto: Partial<CreateDoctorDto>): Promise<Doctor> {
    try {
      const doctor = this.doctorRepository.create();
      doctor.user = createDoctorDto.user;

      if (createDoctorDto.education) {
        doctor.educations = [createDoctorDto.education];
      }
      if (createDoctorDto.experience) {
        doctor.experiences = [createDoctorDto.experience];
      }

      return await this.doctorRepository.save(doctor);
    } catch (error) {
      // You can log the error or throw a custom exception here
      console.error('Error creating doctor:', error);
      throw new Error('Failed to create doctor');
    }
  }

  async crerateDoctorProfile(
    createProfileDoctor: CreateProfileDto,
    user: User,
  ): Promise<Doctor> {
    const doctor = await this.findByUserId(user.id);

    console.log(doctor, 'form -------------------->>>>>>>>>>>>>>>>>>>');

    doctor.introduction = createProfileDoctor.introduction ?? null;
    doctor.BMDC = createProfileDoctor.BMDC ?? null;
    console.log(createProfileDoctor.specialtyIds, 0);

    if (createProfileDoctor.specialtyIds?.length) {
      console.log(1);
      const specialties = await this.specialRepository.find({
        where: {
          id: In(createProfileDoctor.specialtyIds),
        },
      });
      console.log(specialties, '---------------------------------->>');
      doctor.specialties = specialties;
    } else {
      console.log(2);
      doctor.specialties = [];
    }

    return this.doctorRepository.save(doctor);
  }

  // async create(createDoctorDto: Partial<CreateDoctorDto>): Promise<Doctor> {
  //   const doctor = this.doctorRepository.create();
  //   doctor.user = createDoctorDto.user;
  //   if (createDoctorDto.education) {
  //     doctor.educations = [createDoctorDto.education];
  //   }
  //   if (createDoctorDto.experience) {
  //     doctor.experiences = [createDoctorDto.experience];
  //   }

  //   doctor.introduction = createDoctorDto.introduction ?? null;
  //   doctor.BMDC = createDoctorDto.BMDC ?? null;

  //   if (createDoctorDto.specialtyIds.length) {
  //     const specialties = await this.specialRepository.find({
  //       where: {
  //         id: In(createDoctorDto.specialtyIds),
  //       },
  //     });
  //     doctor.specialties = specialties;
  //   } else {
  //     doctor.specialties = [];
  //   }

  //   return this.doctorRepository.save(doctor);
  // }

  async getAllDoctorsWithStatus() {
    const doctors = await this.findAll();
    const activeDoctors = this.callGateway.getActiveDoctors();

    return doctors.map((doctor) => ({
      ...doctor,
      isActive: activeDoctors.has(doctor.id),
      callerId: activeDoctors.get(doctor.id) || null, // Include callerId if present
    }));
  }

  async findAll(isApproved?: any): Promise<Doctor[]> {
    const query = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.educations', 'educations')
      .leftJoinAndSelect('doctor.experiences', 'experiences')
      .leftJoinAndSelect('doctor.specialties', 'specialties') // Add this line
      .leftJoin('doctor.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.email']);

    // Apply the filter only if isApproved is provided
    if (isApproved !== undefined) {
      query.where('doctor.isApproved = :isApproved', { isApproved });
    }

    return query.getMany();
  }
  async findByUserId(userId: number): Promise<Doctor | null> {
    return this.doctorRepository.findOne({
      where: { user: { id: userId } }, // Fix: Query inside the relation
      relations: ['user', 'educations', 'experiences'], // Fix: Correct relation names
    });
  }

  // async findDoctorById(id: number): Promise<Doctor | null> {
  //   return this.doctorRepository.findOne({
  //     where: { id },
  //     relations: ['experiences', 'educations', 'current_medications'], // Load these relations eagerly
  //   });
  // }

  async findDoctorById(id: number): Promise<Doctor | null> {
    try {
      return await this.doctorRepository.findOne({
        where: { id },
        relations: ['experiences', 'educations'], // use property names from entity, not entity class names
      });
    } catch (error) {
      // Handle error as needed, e.g., log and return null or rethrow
      console.error('Error finding doctor:', error);
      return null;
    }
  }

  async findDoctorByEmail(email: string): Promise<Doctor | null> {
    return this.doctorRepository.findOne({
      where: { user: { email } }, // Query by related user's email
      relations: ['user', 'experiences', 'educations'], // Include user and relations
    });
  }

  async findOne(id: number): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { id } });
  }

  async update(id: number, doctorData: Partial<Doctor>): Promise<Doctor> {
    const doctor = await this.findOne(id);
    if (!doctor) {
      throw new BadRequestException('Doctor Not Found!');
    }
    Object.assign(doctor, doctorData);
    return this.doctorRepository.save(doctor);
  }

  async delete(id: number): Promise<void> {
    await this.doctorRepository.delete(id);
  }

  async updateApprovalStatus(doctor: any): Promise<Doctor> {
    doctor.isApproved = true;
    return this.doctorRepository.save(doctor);
  }

  async updateDisapproveStatus(doctor: any): Promise<Doctor> {
    doctor.isApproved = false;
    return this.doctorRepository.save(doctor);
  }
}
