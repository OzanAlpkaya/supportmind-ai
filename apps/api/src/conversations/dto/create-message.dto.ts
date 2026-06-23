import { MessageSender, MessageType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsEnum(MessageSender)
  sender!: MessageSender;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}
