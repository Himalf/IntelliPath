import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { phone: string }) {
    return this.authService.requestPasswordReset(body.phone);
  }
  @Post('reset-password')
  resetPassword(
    @Body() body: { phone: string; token: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      body.phone,
      body.token,
      body.newPassword,
    );
  }
}
