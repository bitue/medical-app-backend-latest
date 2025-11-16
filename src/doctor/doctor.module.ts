import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';
import { UsersModule } from 'src/users/users.module';
import { CallGateway } from '@/call/call.gateway';
import { SpecialtiesService } from '@/specialties/specialties.service';
import { Specialty } from '@/specialties/entities/specialty.entity';
import { EducationService } from '@/education/education.service';
import { ExperienceService } from '@/experience/experience.service';
import { EducationModule } from '@/education/education.module';
import { ExperienceModule } from '@/experience/experience.module';
import { UsersService } from '@/users/users.service';
import { DoctorInformation } from './doctorInformation.entity';
import { StripeService } from '@/stripe/stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Specialty, DoctorInformation]),
    UsersModule,
    forwardRef(() => EducationModule),
    ExperienceModule,
  ],
  providers: [DoctorService, CallGateway, SpecialtiesService, StripeService],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'doctors', method: RequestMethod.GET },
        'doctors/{*splat}',
      )
      .forRoutes(DoctorController);
  }
}
