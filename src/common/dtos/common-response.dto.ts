import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class ErrorDetailDto {
    @IsString()
    field: string;

    @IsString()
    message: string;

    @IsString()
    in: string;
}

export class CommonResponseDto {
    @IsString()
    code: string;

    @IsString()
    message: string;

    @IsOptional()
    data?: any; 
@IsBoolean()
    status : boolean;
}
