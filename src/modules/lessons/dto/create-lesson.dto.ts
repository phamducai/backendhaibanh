import { IsString, IsUUID, IsInt, IsOptional, IsBoolean, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @IsUUID()
  lessonid: string;

  @IsUUID()
  chapterid: string;

  @IsString()
  lessonname: string;

  @IsUrl()
  @IsOptional()
  videourl?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  displayorder: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isdeleted?: boolean;
}