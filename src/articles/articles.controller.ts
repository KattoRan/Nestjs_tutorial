import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma';
import { PaginationDto } from 'src/common/pagination.dto';

@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('all')
  getListArticles(@Query() paginationDto: PaginationDto) {
    return this.articlesService.findAll(paginationDto);
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  create(@Body() createArticleDto: CreateArticleDto, @GetUser() user: User) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  getMyArticles(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.articlesService.findUserArticles(user.id, paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':slug')
  update(
    @Param('slug') slug: string,
    @Body() createArticleDto: CreateArticleDto,
    @GetUser() user: User,
  ) {
    return this.articlesService.update(slug, createArticleDto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug')
  delete(@Param('slug') slug: string, @GetUser() user: User) {
    return this.articlesService.delete(slug, user.id);
  }
}
