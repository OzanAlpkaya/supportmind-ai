import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Request } from 'express';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create(req.user.id, workspaceId, createDocumentDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest, @Headers('x-workspace-id') workspaceId: string) {
    return this.documentsService.findAll(req.user.id, workspaceId);
  }

  @Post(':id/chunks/rebuild')
  rebuildChunks(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.rebuildChunks(req.user.id, workspaceId, documentId);
  }

  @Get(':id/chunks')
  findChunks(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.findChunks(req.user.id, workspaceId, documentId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.findOne(req.user.id, workspaceId, documentId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') documentId: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(req.user.id, workspaceId, documentId, updateDocumentDto);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Headers('x-workspace-id') workspaceId: string,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.remove(req.user.id, workspaceId, documentId);
  }
}
