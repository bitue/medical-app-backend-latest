import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToMany, JoinColumn, OneToMany, JoinTable, ManyToOne } from 'typeorm';

import { Patient } from '@/patient/patient.entity';
import { Doctor } from '@/doctor/doctor.entity';

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({default : ''})
  title : string;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions, {
    onDelete: 'CASCADE', // If a patient is deleted, their prescriptions are deleted too
    eager: true, // Automatically fetch patient details when querying a prescription
  })
  patient: Patient;


  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions, {
    onDelete: 'CASCADE', // If a patient is deleted, their prescriptions are deleted too
    eager: true, // Automatically fetch patient details when querying a prescription
  })
  doctor: Doctor;

  @Column()
  docPath : string;

  @Column()
  prescriptionDate: Date;
  
}
