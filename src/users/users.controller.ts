import { Controller, UseGuards } from '@nestjs/common';

import { Body, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dtos/update-users.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthDto } from 'src/auth/dtos/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiResponse({
    status: 200,
    description: 'User successfully updated.',
    type: User,
    example: {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      role: 'patient',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid user data.',
    type: User,
    example: {
      code: 400,
      message: 'Invalid user data!',
      data: null,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    type: User,
    example: {
      code: 404,
      message: 'User not found!',
      data: null,
    },
  })
  @ApiBody({
    description: 'Partial user data to update',
    type: UpdateUserDto,
  })
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
      status : true
    }
  }
}
