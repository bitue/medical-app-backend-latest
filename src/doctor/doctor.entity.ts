import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
  JoinTable,
} from 'typeorm';

import { User } from 'src/users/users.entity';
import { Education } from 'src/education/education.entity';
import { Experience } from 'src/experience/experience.entity';
import { CurrentMedication } from 'src/current-medication/current-medication.entity';
import { Prescription } from '@/prescription/prescription.entity';
import { Report } from '@/report/report.entity';
import { Appointment } from '@/appointment/appointment.entity';

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
