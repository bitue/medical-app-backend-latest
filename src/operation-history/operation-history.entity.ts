import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';


@Entity('operation-histories')
export class OperationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, patient => patient.operationHistories)
  patient: Patient;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('text', { array: true })
  descriptions: string[];
}

