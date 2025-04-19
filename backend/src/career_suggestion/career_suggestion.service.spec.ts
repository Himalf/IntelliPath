import { Test, TestingModule } from '@nestjs/testing';
import { CareerSuggestionService } from './career_suggestion.service';

describe('CareerSuggestionService', () => {
  let service: CareerSuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareerSuggestionService],
    }).compile();

    service = module.get<CareerSuggestionService>(CareerSuggestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
