import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { RoleGuards } from 'src/auth/guards/roles.guards';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guard';
import { UserRole } from 'src/users/schemas/user.schema';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuards)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EXPERT)
  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(dto);
  }

  @Roles(
    UserRole.USER,
    UserRole.EXPERT,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
    UserRole.GUEST,
  )
  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Roles(
    UserRole.USER,
    UserRole.EXPERT,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
    UserRole.GUEST,
  )
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.courseService.findById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EXPERT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }
}
