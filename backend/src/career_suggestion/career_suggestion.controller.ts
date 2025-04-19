import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CareerSuggestionService } from './career_suggestion.service';

@Controller('career-suggestions')
export class CareerSuggestionController {
  constructor(private readonly suggestionService: CareerSuggestionService) {}

  @Post(':userId')
  async generate(
    @Param('userId') userId: string,
    @Body('skills') skills: string,
  ) {
    return this.suggestionService.generateSuggestion(userId, skills);
  }

  @Get(':userId')
  async getSuggestions(@Param('userId') userId: string) {
    return this.suggestionService.getSuggestionsByUser(userId);
  }
}
