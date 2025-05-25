import { Appointment } from '@/appointment/appointment.entity';
import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';
import { User } from 'src/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// ==================================================== //

@Entity('current_medications')
export class CurrentMedication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.currentMedications, {
    nullable: false,
  })
  patient: Patient;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.providedMedications,
    {
      nullable: true,
    },
  )
  @JoinColumn()
  appointment: Appointment;

  // @ManyToOne(() => Doctor, (doctor) => doctor.providedMedications, {
  //   nullable: true,
  // })
  // doctor: Doctor | null;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column('text', { nullable: true })
  doses: string | null;

  @Column({ default: false })
  isRunning: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

// @Entity('current_medications')
// export class CurrentMedication {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => Patient, (patient) => patient.currentMedications)
//   patient: Patient;

//   @ManyToOne(() => Doctor, (doctor) => doctor.currentMedications, {
//     nullable: true,
//   })
//   doctor: Doctor | null;

//   @Column()
//   startDate: Date;

//   @Column()
//   endDate: Date;

//   @Column('text', { array: true })
//   doses: string[];

//   @Column({ default: true })
//   isRunning: boolean; // true if medication is currently running, false otherwise
// }

// @Entity('current_medications')
// export class CurrentMedication {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => Patient, patient => patient.currentMedications)
//   patient: Patient;

//   @ManyToOne(() => Doctor, doctor => doctor.currentMedications)
//   doctor: Doctor;

//   @Column()
//   startDate: Date;

//   @Column()
//   endDate: Date;

//   @Column('text', { array: true })
//   doses: string[];
// }
