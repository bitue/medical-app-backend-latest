import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToMany, JoinColumn, OneToMany, JoinTable, ManyToOne } from 'typeorm';

import { Patient } from '@/patient/patient.entity';
import { Doctor } from '@/doctor/doctor.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.reports, {
    onDelete: 'CASCADE', // If a patient is deleted, their prescriptions are deleted too
    eager: true, // Automatically fetch patient details when querying a prescription
  })
  patient: Patient;

  @Column({default : ''})
  title : string;

  @Column()
  docPath : string;

  @Column()
  reportDate: Date;
  
}
