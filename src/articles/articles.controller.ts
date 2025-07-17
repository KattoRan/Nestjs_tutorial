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
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma';

@Controller('api')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('articles/all')
  GetListArticles() {
    return this.articlesService.findAll();
  }

  @Get('articles/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('articles')
  create(@Body() createArticleDto: CreateArticleDto, @GetUser() user: User) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('articles')
  GetMyArticles(@GetUser() user: User) {
    return this.articlesService.findDrafts(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('articles/:slug')
  update(
    @Param('slug') slug: string,
    @Body() createArticleDto: CreateArticleDto,
    @GetUser() user: User,
  ) {
    return this.articlesService.update(slug, createArticleDto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('articles/:slug')
  delete(@Param('slug') slug: string, @GetUser() user: User) {
    return this.articlesService.delete(slug, user.id);
  }
}
