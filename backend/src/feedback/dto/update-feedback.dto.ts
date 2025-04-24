// src/feedback/dto/update-feedback.dto.ts
import {
  IsOptional,
  IsString,
  Min,
  Max,
  IsInt,
  IsMongoId,
} from 'class-validator';

export class UpdateFeedbackDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
  @IsOptional()
  @IsMongoId() // To ensure it's a valid MongoDB ObjectId
  userId?: string; // Optional in case you want to update the userId
}
