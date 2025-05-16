import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { SendEmailDto } from './dtos/send-email.dto';

@Injectable()
export class EmailService {
  private mailTransport: Transporter;

  //   POSTGRES_HOST=localhost
  // POSTGRES_PORT=5432
  // POSTGRES_USER=postgres
  // POSTGRES_PASSWORD=password
  // POSTGRES_DB=medicalapp
  // EMAIL_HOST=smtp.gmail.com
  // EMAIL_PORT=587
  // EMAIL_USERNAME=ashikul.islam.ugrad16@gmail.com
  // EMAIL_PASSWORD=bxbzoztgpfveqljp

  constructor(private configService: ConfigService) {
    this.mailTransport = createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: Number(this.configService.get('EMAIL_PORT')),
      secure: false, // TODO: upgrade later with STARTTLS
      auth: {
        user: this.configService.get('EMAIL_USERNAME'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(data: SendEmailDto): Promise<{ success: boolean } | null> {
    const { sender, recipients, subject, html, text } = data;

    const mailOptions: SendMailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: recipients,
      subject,
      html, // valid HTML body
      text, // plain text body
    };

    try {
      await this.mailTransport.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      // handle error
      console.log('error', error);
      return null;
    }
  }
}
