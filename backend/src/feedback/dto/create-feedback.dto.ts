import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
