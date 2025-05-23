import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/users/users.entity';
import { Education } from 'src/education/education.entity';
import { Experience } from 'src/experience/experience.entity';
import { CurrentMedication } from 'src/current-medication/current-medication.entity';
import { Prescription } from '@/prescription/prescription.entity';
import { Report } from '@/report/report.entity';
import { Appointment } from '@/appointment/appointment.entity';
import { Specialty } from '@/specialties/entities/specialty.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Education)
  @JoinTable()
  educations: Education[];

  @ManyToMany(() => Experience)
  @JoinTable()
  experiences: Experience[];

  @ManyToMany(() => Specialty)
  @JoinTable()
  specialties: Specialty[];

  // One Doctor provides many CurrentMedications
  @OneToMany(
    () => CurrentMedication,
    (currentMedication) => currentMedication.doctor,
  )
  providedMedications: CurrentMedication[];

  @OneToMany(() => Prescription, (prescription) => prescription.doctor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  prescriptions: Prescription[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  appointments: Appointment[];

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('text', { nullable: true }) // text type, nullable if you want it optional
  introduction: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // string with max length 255
  BMDC: string;
}

// @Entity()
// export class Doctor {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @OneToOne(() => User)
//   @JoinColumn()
//   user: User;

//   @ManyToMany(() => Education)
//   @JoinTable()
//   educations: Education[];

//   @ManyToMany(() => Experience)
//   @JoinTable()
//   experiences: Experience[];

//   @OneToMany(() => CurrentMedication, currentMedication => currentMedication.doctor)
//   currentMedications: CurrentMedication[];

//   @OneToMany(() => Prescription, (prescription) => prescription.doctor, {
//     cascade: true, // Automatically persist related prescriptions if a patient is saved
//     onDelete: 'CASCADE', // Deletes prescriptions if the patient is deleted
//   })
//   prescriptions: Prescription[];

//   @OneToMany(() => Appointment, (appointment) => appointment.doctor, {
//     cascade: true, // Automatically persist related prescriptions if a patient is saved
//     onDelete: 'CASCADE', // Deletes prescriptions if the patient is deleted
//   })
//   appointments: Appointment[];

//   @Column({default : false})
//   isApproved : boolean;
// }
