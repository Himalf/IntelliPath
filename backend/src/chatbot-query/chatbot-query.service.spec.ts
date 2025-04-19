import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotQueryService } from './chatbot-query.service';

describe('ChatbotQueryService', () => {
  let service: ChatbotQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotQueryService],
    }).compile();

    service = module.get<ChatbotQueryService>(ChatbotQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
