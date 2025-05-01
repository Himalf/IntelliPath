import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';
// Validate the Fields
export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsOptional()
  @IsString()
  phone: string;
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  resume_url?: string;
}
// dto/request-password-reset.dto.ts
export class RequestPasswordResetDto {
  email: string;
}

// dto/reset-password.dto.ts
export class ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}
