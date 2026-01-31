import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { Body, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dtos/update-users.dto';
import { DeleteUserDto } from './dtos/delete-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthDto } from 'src/auth/dtos/auth.dto';
import data from '@/utils/commonData';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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

  @Delete('deleteAllData')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteUserByToken(@Request() req): Promise<any> {
    try {
      // Get user from request (set by AuthGuard)
      const user = req.user;

      if (!user || !user.id) {
        throw new BadRequestException('User not found in token');
      }

      console.log('🗑️ Deleting user:', user.id);

      // Delete the user
      await this.usersService.deleteAccount(user.id);

      return {
        code: '200',
        message: 'User account deleted successfully',
        status: true,
      };
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw new BadRequestException(error.message || 'Failed to delete user');
    }
  }

  @Delete('deleteByCredentials')
  @HttpCode(HttpStatus.OK)
  async deleteByCredentials(@Body() dto: DeleteUserDto): Promise<any> {
    try {
      await this.usersService.deleteWithCredentials(dto);
      return {
        code: 200,
        message: 'Account deleted successfully',
        status: true,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to delete account');
    }
  }

  // @Delete(':id')
  // @UseGuards(AuthGuard, RoleGuard) // update it to ADMIN role Later
  // @Roles('admin')
  // async deleteUser(@Param('id') id: number): Promise<void> {
  //   return this.usersService.deleteAccount(id);
  // }
}
