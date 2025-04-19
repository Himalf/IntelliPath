import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { RoleGuards } from 'src/auth/guards/roles.guards';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guard';
import { UserRole } from 'src/users/schemas/user.schema';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuards)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly svc: FeedbackService) {}

  @Roles(UserRole.USER, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  create(@Body() dto: CreateFeedbackDto) {
    return this.svc.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Roles(UserRole.USER, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.svc.findByUser(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.svc.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
