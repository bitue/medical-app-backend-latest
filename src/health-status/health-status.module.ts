import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { HealthStatusController } from './health-status.controller';
import { HealthStatusService } from './health-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthStatus } from './health-status.entity';
import { UsersModule } from 'src/users/users.module';
import { PatientModule } from 'src/patient/patient.module';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';
import { Patient } from '@/patient/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthStatus, Patient]),
    UsersModule,
    PatientModule,
  ],
  controllers: [HealthStatusController],
  providers: [HealthStatusService],
})
export class HealthStatusModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'health-status', method: RequestMethod.GET },
        'health-status/{*splat}',
      )
      .forRoutes(HealthStatusController);
  }
}
