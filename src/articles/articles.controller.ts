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
  Patch,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma';
import { PaginationDto } from 'src/common/pagination.dto';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';
import { PublishArticlesDto } from './dto/publish-articles.dto';

@ApiHeader({
  name: 'Accept-Language',
  description: 'Ngôn ngữ phản hồi (vi, en, ja)',
  required: false,
})
@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getListArticles(@Query() paginationDto: PaginationDto) {
    return this.articlesService.findAll(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyArticles(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.articlesService.findMyArticles(user.id, paginationDto);
  }

  @Get('user/:id')
  getUserArticles(
    @Param('id') id: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.articlesService.findUserArticles(id, paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('publish')
  publishArticles(
    @Body() publishDto: PublishArticlesDto, // 3. Lấy và validate body với DTO
    @GetUser() user: User,
  ) {
    return this.articlesService.publish(publishDto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  findBySlug(@Param('slug') slug: string, @GetUser() user: User) {
    return this.articlesService.findBySlug(slug, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createArticleDto: CreateArticleDto, @GetUser() user: User) {
    return this.articlesService.create(createArticleDto, user.id);
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/:slug/favorite')
  async favorite(@GetUser() user: User, @Param('slug') slug: string) {
    return this.articlesService.favorite(slug, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:slug/favorite')
  async unfavorite(@GetUser() user: User, @Param('slug') slug: string) {
    return this.articlesService.unfavorite(slug, user.id);
  }
}
