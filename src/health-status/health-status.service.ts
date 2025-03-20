import { InjectRepository } from "@nestjs/typeorm";
import { HealthStatus } from "./health-status.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { HealthStatusCreateDto } from "./dto/helth-status-create.dto";


@Injectable()
export class HealthStatusService {
    constructor(
        @InjectRepository(HealthStatus)
        private readonly healthStatusRepository: Repository<HealthStatus>,
      ) {}

      async create(healthStatusData: HealthStatusCreateDto): Promise<HealthStatus> {
        const operationHistory = this.healthStatusRepository.create(healthStatusData);
        return this.healthStatusRepository.save(operationHistory);
      }
}


