import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  subject?: string;
}
