import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Body, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dtos/update-users.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthDto } from 'src/auth/dtos/auth.dto';
import data from '@/utils/commonData';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('commonQuery')
  async commonQuery(@Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('Query param "key" is required');
    }

    // Access nested 'data' object from imported data
    const value = data.data[key];

    if (value === undefined) {
      throw new BadRequestException(`Key "${key}" not found`);
    }

    return { key, value };
  }

  @UseGuards(AuthGuard)
  @Patch(':email')
  async updateUser(
    @Param('email') email: string,
    @Body() userData: Partial<UpdateUserDto>,
  ): Promise<any> {
    const user = this.usersService.update(email, userData);

    return {
      code: '200',
      message: 'User Role updated successfully!.',
      data: user,
      status: true,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard) // update it to ADMIN role Later
  @Roles('admin')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.usersService.delete(id);
  }

  @Delete('public/:id')
  async deleteUserByPlaystore(@Param('id') id: number): Promise<void> {
    return this.usersService.delete(id);
  }
}
