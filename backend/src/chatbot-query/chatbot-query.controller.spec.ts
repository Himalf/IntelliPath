import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotQueryController } from './chatbot-query.controller';

describe('ChatbotQueryController', () => {
  let controller: ChatbotQueryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotQueryController],
    }).compile();

    controller = module.get<ChatbotQueryController>(ChatbotQueryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
