import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('/api/articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getComments(@Param('slug') slug: string) {
    return this.commentsService.findComments(slug);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createComment(
    @GetUser() user: User,
    @Param('slug') slug: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(slug, createCommentDto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(
    @GetUser() user: User,
    @Param('slug') slug: string,
    @Param('id') id: number,
  ) {
    return this.commentsService.delete(slug, id, user.id);
  }
}
