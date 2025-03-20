import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';
import { UsersModule } from 'src/users/users.module';
import { CallGateway } from '@/call/call.gateway';

@Module({
  imports : [TypeOrmModule.forFeature([Doctor]), UsersModule],
  providers: [DoctorService, CallGateway],
  controllers: [DoctorController],
  exports : [DoctorService]
})
export class DoctorModule {
  
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).exclude(
      { path: 'doctors', method: RequestMethod.GET },
      'doctors/{*splat}',
    ).forRoutes(DoctorController);
  }
}
