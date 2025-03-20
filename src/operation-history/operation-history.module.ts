import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { OperationHistoryController } from './operation-history.controller';
import { OperationHistoryService } from './operation-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationHistory } from './operation-history.entity';
import { UsersModule } from 'src/users/users.module';
import { PatientModule } from 'src/patient/patient.module';
import { CurrentUserMiddleware } from 'src/common/middleware/current-user.middleware';

@Module({
  imports : [TypeOrmModule.forFeature([OperationHistory]), UsersModule, PatientModule],
  controllers: [OperationHistoryController],
  providers: [OperationHistoryService]
})
export class OperationHistoryModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).exclude(
      { path: 'operation-history', method: RequestMethod.GET },
      'operation-history/{*splat}',
    ).forRoutes(OperationHistoryController);
  }
}
