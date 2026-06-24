import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}
