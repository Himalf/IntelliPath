// src/feedback/dto/update-feedback.dto.ts
import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';

export class UpdateFeedbackDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
