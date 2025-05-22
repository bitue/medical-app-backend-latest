import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OperationHistoryService } from './operation-history.service';
import { PatientService } from 'src/patient/patient.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateOperationHistoryDto } from './dtos/create-operation-history.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RoleGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('operation-history')
export class OperationHistoryController {
  constructor(
    private readonly operationHistory: OperationHistoryService,
    private readonly patientService: PatientService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('patient')
  async create(
    @Body() operationHistoryData: CreateOperationHistoryDto,
    @CurrentUser() user: User,
  ) {
    try {
      const existingPatient = await this.patientService.findByUserId(user?.id);
      const operationHistory = await this.operationHistory.create({
        descriptions: operationHistoryData?.descriptions,
        startDate: operationHistoryData?.startDate,
        endDate: operationHistoryData?.endDate,
      });

      if (!existingPatient) {
        throw new BadRequestException('Patient profile not found !');
      }
      await this.patientService.update(existingPatient.id, {
        operationHistories: [
          ...existingPatient.operationHistories,
          operationHistory,
        ],
      });
      return {
        code: '201',
        message: 'Operation history data created successfully!',
        data: operationHistory,
        status: true,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
