import { Doctor } from '@/doctor/doctor.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hospitalName: string;

  @Column()
  designation: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.experiences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  doctor: Doctor;
}
