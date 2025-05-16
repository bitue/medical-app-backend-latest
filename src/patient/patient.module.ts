import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { UsersModule } from 'src/users/users.module';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';
import { HealthStatus } from '@/health-status/health-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, HealthStatus]), UsersModule],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'patient', method: RequestMethod.GET },
        'patient/{*splat}',
      )
      .forRoutes(PatientController);
  }
}
