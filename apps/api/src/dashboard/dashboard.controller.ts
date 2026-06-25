import { Controller, Get, Headers, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { DashboardService } from './dashboard.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
  ) {
    return this.dashboardService.getSummary(req.user.id, workspaceId);
  }
}
