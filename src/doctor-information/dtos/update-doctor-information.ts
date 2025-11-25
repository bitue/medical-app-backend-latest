export class UpdateDoctorInformationDto {
  paymentAmount?: number;
  schedule?: string[];
  adminApproval?: boolean; // only admin can update this
}
