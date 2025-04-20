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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from './schemas/user.schema';
import { RoleGuards } from 'src/auth/guards/roles.guards';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //  All authenticated roles can view the user list
  @UseGuards(JwtAuthGuard, RoleGuards)
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.SUPERADMIN, UserRole.EXPERT)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Only the user themselves, or admin/superadmin can fetch a specific user
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER, UserRole.EXPERT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //  Only the user themselves, or admin/superadmin can update
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.USER, UserRole.EXPERT)
  @Patch(':id')
  update(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.update(updateUserDto, id);
  }

  //  Only ADMIN or SUPERADMIN can delete users
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
