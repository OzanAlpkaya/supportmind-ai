import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.workspacesService.findAllForUser(req.user.id);
  }

  @Get('current')
  getCurrent(@Req() req: AuthenticatedRequest) {
    return this.workspacesService.findCurrentForUser(req.user.id);
  }

  @Patch('current')
  updateCurrent(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.updateCurrentWorkspace(
      req.user.id,
      workspaceId,
      dto,
    );
  }

  @Get('current/members')
  findCurrentMembers(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
  ) {
    return this.workspacesService.findMembers(req.user.id, workspaceId);
  }
}
