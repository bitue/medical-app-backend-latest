import { IsString, IsObject, IsBoolean } from 'class-validator';

export class AuthDto {
    @IsString()
    code: string;

    @IsString()
    message: string;

    @IsObject()
    data: {
        token: string;
        email: string;
        username: string;
        id : number;
        role : string;
        patientOrDoctorId: number;
    };

    @IsBoolean()
    status : boolean
}


