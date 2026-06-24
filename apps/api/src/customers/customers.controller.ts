import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomersService } from './customers.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(req.user.id, workspaceId, dto);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
  ) {
    return this.customersService.findAll(req.user.id, workspaceId);
  }
}
