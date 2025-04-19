import { IsString, IsNotEmpty, IsUrl, IsArray } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
