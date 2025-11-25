import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from '@/doctor/doctor.entity';

@Entity()
export class DoctorInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Doctor, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  doctor: Doctor;

  @Column({ type: 'int' })
  paymentAmount: number;

  @Column({ type: 'simple-array', nullable: true })
  schedule: string[]; // Example: ["10-12 AM", "4-8 PM"]

  @Column({ type: 'boolean', default: false })
  adminApproval: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
