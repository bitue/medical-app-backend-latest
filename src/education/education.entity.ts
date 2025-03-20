

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


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
}
