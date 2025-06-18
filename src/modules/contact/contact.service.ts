import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendContactDto } from './dto/send-contact.dto';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Cấu hình transporter cho email
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Hoặc smtp server khác
      auth: {
        user: this.configService.get('EMAIL_USER'), // Email của bạn
        pass: this.configService.get('EMAIL_PASS'), // App password của email
      },
    });
  }

  async sendContactEmail(sendContactDto: SendContactDto) {
    const { name, email, phone, message } = sendContactDto;
    
    const emailContent = `
      <h2>Liên hệ mới từ website</h2>
      <p><strong>Tên:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Số điện thoại:</strong> ${phone}</p>` : ''}
      <p><strong>Nội dung:</strong></p>
      <p>${message}</p>
    `;

    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: 'haismartlife@gmail.com', // Email nhận
      subject: `[Website Contact] Gửi Mail từ website`,
      html: emailContent,
      replyTo: email, // Cho phép reply trực tiếp về email người gửi
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        message: 'Email đã được gửi thành công',
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Không thể gửi email. Vui lòng thử lại sau.');
    }
  }
} 