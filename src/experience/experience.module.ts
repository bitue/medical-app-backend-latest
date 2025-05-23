import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from './experience.entity';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';
import { EducationController } from 'src/education/education.controller';
import { DoctorModule } from 'src/doctor/doctor.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Experience]), UsersModule],
  providers: [ExperienceService],
  controllers: [ExperienceController],
  exports: [ExperienceService],
})
export class ExperienceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'experience', method: RequestMethod.GET },
        'education/{*splat}',
      )
      .forRoutes(ExperienceController);
  }
}
