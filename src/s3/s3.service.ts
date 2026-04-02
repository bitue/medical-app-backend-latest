import { BadRequestException, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
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
      endpoint: this.configService.get<string>('DO_SPACES_ENDPOINT'),
      region: this.configService.get<string>('DO_SPACES_REGION'),
      forcePathStyle: false,
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('DO_SPACES_SECRET_KEY'),
      },
    });

    this.bucketName = this.configService.get<string>('DO_SPACES_BUCKET');
  }

  // Upload file and return the file key and public URL
  async uploadFile(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const fileKey = `${uuidv4()}-${file.originalname}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));
      const region = this.configService.get<string>('DO_SPACES_REGION');
      const publicUrl = `https://${this.bucketName}.${region}.digitaloceanspaces.com/${fileKey}`;

      console.log('✅ File uploaded successfully:', publicUrl);

      // Return both key (for delete) and publicUrl (for frontend display)
      return { key: fileKey, url: publicUrl };
    } catch (err) {
      console.error('Upload Error:', err);
      throw err;
    }
  }

  // Generate a pre-signed URL for a file in DigitalOcean Spaces
  async getPresignedUrl(
    fileKey: string,
    expiresInSeconds = 6 * 86400,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds, // URL expiry time (default: 6 days)
      });

      return presignedUrl;
    } catch (err) {
      console.error('Pre-signed URL Error:', err);
      throw err;
    }
  }

  // Delete file from DigitalOcean Spaces
  async deleteFile(fileKey: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    await this.s3Client.send(new DeleteObjectCommand(deleteParams));
  }
}
