import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dtos/create-admin.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
    ) { }


    async create(createAdminDto: CreateAdminDto): Promise<Admin> {
        const admin = this.adminRepository.create(createAdminDto);
        return this.adminRepository.save(admin);
    }

    async findOne(email: string): Promise<Admin> {
        return this.adminRepository.findOne({ where: { email } });
    }
}
