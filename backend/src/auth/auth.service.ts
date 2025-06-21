import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password === password) {
      const { password: _password, ...result } = user.toObject(); // Mongoose doc → plain object
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      role: user.role,
      sub: user._id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not Found');
    const token = uuidv4();

    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;
    await this.mailService.sendResetLink(email, resetLink);
  }

  // Reset Password
  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (
      !user ||
      user.resetToken !== token ||
      user.resetTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
  }
}
