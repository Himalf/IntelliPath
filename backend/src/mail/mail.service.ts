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
    const mailOptions = {
      from: `"IntelliPath Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your IntelliPath Account Password',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">IntelliPath Password Reset Request</h2>
          <p>Hi there,</p>
          <p>We received a request to reset the password for your IntelliPath account associated with this email address.</p>
          <p>
            <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #1a202c; color: #ffffff; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>This link is valid for 15 minutes. If you didn’t request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Thank you,<br/>The IntelliPath Team</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
