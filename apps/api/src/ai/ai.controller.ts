import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AiService } from './ai.service';
import { AskQuestionDto } from './dto/ask-question.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('answer')
  answerQuestion(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Body() askQuestionDto: AskQuestionDto,
  ) {
    return this.aiService.answerQuestion(
      req.user.id,
      workspaceId,
      askQuestionDto.question,
    );
  }
}
