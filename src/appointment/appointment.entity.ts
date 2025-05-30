import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Prescription } from '@/prescription/prescription.entity';
import { Report } from '@/report/report.entity';
import { Doctor } from '@/doctor/doctor.entity';
import { Patient } from '@/patient/patient.entity';
import { CurrentMedication } from '@/current-medication/current-medication.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'CASCADE', // If a Doctor is deleted, their prescriptions are deleted too
    eager: true, // Automatically fetch patient details when querying a prescription
  })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'CASCADE', // If a patient is deleted, their prescriptions are deleted too
    eager: true, // Automatically fetch patient details when querying a prescription
  })
  patient: Patient;

  @ManyToMany(() => Report)
  @JoinTable()
  reports: Report[];

  @ManyToMany(() => Prescription)
  @JoinTable()
  prescriptions: Prescription[];

  @Column({ nullable: true })
  appointmentSlot: String;

  @Column()
  accessTime: number;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(
    () => CurrentMedication,
    (currentmedication) => currentmedication.appointment,
    {
      onDelete: 'CASCADE',
      eager: true,
    },
  )
  providedMedications: CurrentMedication[];
}
