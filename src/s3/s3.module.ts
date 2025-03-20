import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';

@Module({
  imports: [ConfigModule],
  providers: [S3Service],
  exports: [S3Service],
  controllers: [S3Controller],
})
export class S3Module {}

