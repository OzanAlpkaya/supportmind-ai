import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(userId: string, workspaceId: string, dto: CreateCustomerDto) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    try {
      return await this.prisma.customer.create({
        data: {
          email: dto.email,
          name: dto.name,
          workspaceId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Customer already exists in this workspace',
        );
      }

      throw error;
    }
  }

  async findAll(userId: string, workspaceId: string) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    return this.prisma.customer.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
