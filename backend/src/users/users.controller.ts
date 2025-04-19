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
import { User, UserRole } from './schemas/user.schema';
import { RoleGuards } from 'src/auth/guards/roles.guards';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuards)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.SUPERADMIN, UserRole.EXPERT)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Get(':id')
  findOne(@Param() id: string) {
    return this.usersService.findOne(id);
  }
  @Patch(':id')
  update(@Body() updateUserDto: UpdateUserDto, @Param() id: string) {
    return this.usersService.update(updateUserDto, id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
