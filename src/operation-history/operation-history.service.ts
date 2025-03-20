import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationHistory } from './operation-history.entity';
import { Repository } from 'typeorm';
import { CreateOperationHistoryDto } from './dtos/create-operation-history.dto';

@Injectable()
export class OperationHistoryService {
    constructor(
        @InjectRepository(OperationHistory)
        private readonly operationHistoryRepository: Repository<OperationHistory>,
      ) {}

      async create(operationHistoryData: CreateOperationHistoryDto): Promise<OperationHistory> {
        const operationHistory = this.operationHistoryRepository.create(operationHistoryData);
        return this.operationHistoryRepository.save(operationHistory);
      }
}
