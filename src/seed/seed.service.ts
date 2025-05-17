// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User, UserRole } from 'src/users/users.entity';
// import { Doctor } from 'src/doctor/doctor.entity';
// import { Education } from 'src/education/education.entity';
// import { Experience } from 'src/experience/experience.entity';
// import * as bcrypt from 'bcryptjs';

// @Injectable()
// export class SeedService {
//   constructor(
//     @InjectRepository(User) private userRepo: Repository<User>,
//     @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
//     @InjectRepository(Education) private educationRepo: Repository<Education>,
//     @InjectRepository(Experience)
//     private experienceRepo: Repository<Experience>,
//   ) {}

//   async seedDoctors() {
//     for (let i = 1; i <= 20; i++) {
//       const hashedPassword = await bcrypt.hash('password123', 10);

//       // Create User
//       const user = this.userRepo.create({
//         username: `doctor${i}`,
//         email: `doctor${i}@example.com`,
//         password: hashedPassword,
//         role: UserRole.DOCTOR,
//       });
//       await this.userRepo.save(user);

//       // Create Education
//       const education = this.educationRepo.create({
//         degreeName: 'MBBS',
//         instituteName: `Medical Institute ${i}`,
//         startDate: new Date(2010, 0, 1),
//         endDate: new Date(2015, 11, 31),
//       });
//       await this.educationRepo.save(education);

//       // Create Experience
//       const experience = this.experienceRepo.create({
//         hospitalName: `Hospital ${i}`,
//         designation: 'General Physician',
//         startDate: new Date(2016, 0, 1),
//         endDate: new Date(2023, 11, 31),
//       });
//       await this.experienceRepo.save(experience);

//       // Create Doctor
//       const doctor = this.doctorRepo.create({
//         user: user,
//         educations: [education],
//         experiences: [experience],
//         currentMedications: [],
//       });
//       await this.doctorRepo.save(doctor);
//     }

//     return { message: '20 doctors seeded successfully!' };
//   }
// }
