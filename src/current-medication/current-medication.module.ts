import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CurrentMedicationController } from './current-medication.controller';
import { CurrentMedicationService } from './current-medication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentMedication } from './current-medication.entity';
import { UsersModule } from 'src/users/users.module';
import { PatientModule } from 'src/patient/patient.module';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurrentMedication]),
    UsersModule,
    PatientModule,
    DoctorModule,
  ],
  controllers: [CurrentMedicationController],
  providers: [CurrentMedicationService],
  exports: [CurrentMedicationService],
})
export class CurrentMedicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'current-medication', method: RequestMethod.GET },
        'current-medication/{*splat}',
      )
      .forRoutes(CurrentMedicationController);
  }
}
