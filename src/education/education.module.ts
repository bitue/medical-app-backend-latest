import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Education } from './education.entity';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';
import { DoctorController } from 'src/doctor/doctor.controller';
import { UsersModule } from 'src/users/users.module';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  imports : [TypeOrmModule.forFeature([Education]), UsersModule, DoctorModule],
  providers: [EducationService],
  controllers: [EducationController]
})
export class EducationModule {
   configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).exclude(
      { path: 'education', method: RequestMethod.GET },
      'education/{*splat}',
    ).forRoutes(EducationController);
  }
}
