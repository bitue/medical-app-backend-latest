import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';


@Entity('health-statuses')
export class HealthStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, patient => patient.healthStatuses)
  patient: Patient;

@Column({ default: false })
smokingStatus: boolean;

@Column({ default: false })
exercise: boolean;

@Column({ default: false })
alcoholStatus: boolean;

@Column({ default: false })
covidVaccination: boolean;

@Column({ default: false })
allergy: boolean;

@Column({ default: false })
diabeticsStatus: boolean;
}

