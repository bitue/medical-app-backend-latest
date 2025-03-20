import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';


@Entity('current_medications')
export class CurrentMedication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, patient => patient.currentMedications)
  patient: Patient;

  @ManyToOne(() => Doctor, doctor => doctor => doctor.currentMedications)
  doctor: Doctor;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('text', { array: true })
  doses: string[];
}

