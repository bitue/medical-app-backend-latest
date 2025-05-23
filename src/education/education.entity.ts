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
export class Education {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  degreeName: string;

  @Column()
  instituteName: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.educations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  doctor: Doctor;
}
