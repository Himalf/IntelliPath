import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatbotQueryDto {
  @IsNotEmpty()
  @IsString()
  question: string;
}
