import { Test, TestingModule } from '@nestjs/testing';
import { CareerSuggestionController } from './career_suggestion.controller';

describe('CareerSuggestionController', () => {
  let controller: CareerSuggestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareerSuggestionController],
    }).compile();

    controller = module.get<CareerSuggestionController>(CareerSuggestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
