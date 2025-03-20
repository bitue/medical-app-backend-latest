import { ApiProperty } from '@nestjs/swagger';

export class UpdateApprovalDto {
  @ApiProperty({ example: true, description: 'Set appointment approval status' })
  isApproved: boolean;
}
