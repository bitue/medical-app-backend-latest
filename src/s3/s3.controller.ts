import { Controller, Post, Delete, UploadedFile, Param, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    const fileUrl = await this.s3Service.uploadFile(file);
    return { fileUrl };
  }

  @Delete('delete/:fileKey')
  async deleteFile(@Param('fileKey') fileKey: string) {
    await this.s3Service.deleteFile(fileKey);
    return { message: 'File deleted successfully' };
  }
}

