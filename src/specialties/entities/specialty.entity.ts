import { Doctor } from '@/doctor/doctor.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'typical_name' })
  typicalName: string;

  @Column({ name: 'total_doctor' })
  totalDoctor: number;

  @Column({ name: 'profession_name' })
  professionName: string;

  @Column()
  value: number;

  @Column('text')
  description: string;

  @Column('json', { nullable: true })
  icon: { src: string };

  @Column({ name: 'should_auto_verified', type: 'int', default: 0 })
  shouldAutoVerified: number;

  @ManyToMany(() => Doctor, (doctor) => doctor.specialties)
  doctors: Doctor[];
}
