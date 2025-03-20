import { Appointment } from '@/appointment/appointment.entity';
import { Prescription } from '@/prescription/prescription.entity';
import { Report } from '@/report/report.entity';
import { CurrentMedication } from 'src/current-medication/current-medication.entity';
import { HealthStatus } from 'src/health-status/health-status.entity';
import { OperationHistory } from 'src/operation-history/operation-history.entity';
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => CurrentMedication, (currentMedication) => currentMedication.patient)
  currentMedications: CurrentMedication[]

  @OneToMany(() => OperationHistory, (operationHistory) => operationHistory.patient)
  operationHistories: OperationHistory[]

  @OneToMany(() => HealthStatus, (healthStatus) => healthStatus.patient)
  healthStatuses: HealthStatus[]

  @OneToMany(() => Prescription, (prescription) => prescription.patient, {
    cascade: true, // Automatically persist related prescriptions if a patient is saved
    onDelete: 'CASCADE', // Deletes prescriptions if the patient is deleted
  })
  prescriptions: Prescription[];

  @OneToMany(() => Report, (report) => report.patient, {
    cascade: true, // Automatically persist related prescriptions if a patient is saved
    onDelete: 'CASCADE', // Deletes prescriptions if the patient is deleted
  })
  reports: Report[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient, {
    cascade: true, // Automatically persist related prescriptions if a patient is saved
    onDelete: 'CASCADE', // Deletes prescriptions if the patient is deleted
  })
  appointments: Appointment[];
}
