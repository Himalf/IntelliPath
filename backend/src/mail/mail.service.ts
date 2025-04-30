import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  async sendResetLink(email: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${link}">Click here to reset your password</a></p>
        <p>This link is valid for 15 minutes.</p>
      `,
    });
  }
}
