import { Injectable } from '@nestjs/common';
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
  }

  // Upload file and return the file URL
  async uploadFile(file: any): Promise<string> {
    try {
      const fileKey = `${uuidv4()}-${file.originalname}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      return this.getPresignedUrl(fileKey);
    } catch (err) {
      console.error("S3 Upload Error:", err);
      throw err;
    }
  }

  // Generate a pre-signed URL for a file in S3
  async getPresignedUrl(fileKey: string, expiresInSeconds = 6 * 86400): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds, // URL expiry time (default: 1 hour)
      });

      return presignedUrl;
    } catch (err) {
      console.error("S3 Pre-signed URL Error:", err);
      throw err;
    }
  }

  // Delete file from S3
  async deleteFile(fileKey: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    await this.s3Client.send(new DeleteObjectCommand(deleteParams));
  }
}
