import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
