// doctor-information.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from '@/doctor/doctor.entity';

@Entity()
export class DoctorInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Doctor, (doctor) => doctor.doctorInformation, {
    onDelete: 'CASCADE', // If the doctor is deleted, the associated information is deleted as well
  })
  @JoinColumn()
  doctor: Doctor;

  @Column('decimal', { precision: 10, scale: 2 })
  paymentAmount: number;

  @Column('timestamp', { array: true })
  consultationSchedule: Date[];

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;
}
