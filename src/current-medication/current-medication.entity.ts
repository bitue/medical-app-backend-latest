import { Appointment } from '@/appointment/appointment.entity';
import { Doctor } from 'src/doctor/doctor.entity';
import { Patient } from 'src/patient/patient.entity';
import { User } from 'src/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// ==================================================== //

@Entity('current_medications')
export class CurrentMedication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.currentMedications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  patient: Patient;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.providedMedications,

    {
      nullable: true,
      cascade: true,
    },
  )
  @JoinColumn()
  appointment: Appointment;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column('text', { nullable: true })
  doses: string | null;

  @Column({ default: false })
  isRunning: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
