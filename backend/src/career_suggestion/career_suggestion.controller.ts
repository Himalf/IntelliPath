import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CareerSuggestionService } from './career_suggestion.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guard';
import { RoleGuards } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/users/schemas/user.schema';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuards)
@Controller('career-suggestions')
export class CareerSuggestionController {
  constructor(private readonly suggestionService: CareerSuggestionService) {}

  @Roles(UserRole.USER, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post(':userId')
  async generate(
    @Param('userId') userId: string,
    @Body('skills') skills: string,
  ) {
    return this.suggestionService.generateSuggestion(userId, skills);
  }

  @Roles(UserRole.USER, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get(':userId')
  async getSuggestions(@Param('userId') userId: string) {
    return this.suggestionService.getSuggestionsByUser(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get()
  async getAllSuggestions() {
    return this.suggestionService.findAllSuggestions();
  }
}
