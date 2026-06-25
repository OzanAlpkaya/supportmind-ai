import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationStatusDto } from './dto/update-conversation-status.dto';
import { ConversationsService } from './conversations.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationsService.create(req.user.id, workspaceId, dto);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
  ) {
    return this.conversationsService.findAll(req.user.id, workspaceId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') conversationId: string,
  ) {
    return this.conversationsService.findOne(
      req.user.id,
      workspaceId,
      conversationId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') conversationId: string,
    @Body() dto: UpdateConversationStatusDto,
  ) {
    return this.conversationsService.updateStatus(
      req.user.id,
      workspaceId,
      conversationId,
      dto.status,
    );
  }

  @Post(':id/ai-suggest-reply')
  suggestAiReply(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') conversationId: string,
  ) {
    return this.conversationsService.suggestAiReply(
      req.user.id,
      workspaceId,
      conversationId,
    );
  }

  @Post(':id/messages')
  createMessage(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationsService.createMessage(
      req.user.id,
      workspaceId,
      conversationId,
      dto,
    );
  }
}
