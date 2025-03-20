import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Message{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique : true})
    email: string;

    @Column()
    otp: string;

    @Column({
        default : false
    })
    isVerified: Boolean;

    @Column()
    expiresAt: Date;
}