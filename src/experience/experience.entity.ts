
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';


@Entity()
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hospitalName: string;

  @Column()
  designation: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

}
