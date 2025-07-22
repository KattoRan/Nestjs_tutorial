import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import slugify from 'slugify';
import { skip } from 'rxjs';
import { PaginationDto } from 'src/common/pagination.dto';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/constants/pagination.constant';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(createArticleDto: CreateArticleDto, authorId: number) {
    const slug = slugify(createArticleDto.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingArticle = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      throw new ConflictException(
        this.i18n.translate('articles.article_title_exists'),
      );
    }

    return this.prisma.article.create({
      data: {
        ...createArticleDto,
        slug: slug,
        authorId: authorId,
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = paginationDto;
    const skip = (page - 1) * limit;

    const [total, articles] = await this.prisma.$transaction([
      this.prisma.article.count({ where: { published: true } }),
      this.prisma.article.findMany({
        where: { published: true },
        include: { author: { select: { username: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: articles,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
      },
    };
  }

  async findUserArticles(authorId: number, paginationDto: PaginationDto) {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = paginationDto;
    const skip = (page - 1) * limit;

    const whereClause = { authorId: authorId };

    const [total, articles] = await this.prisma.$transaction([
      this.prisma.article.count({ where: whereClause }),
      this.prisma.article.findMany({
        where: whereClause,
        include: { author: { select: { username: true } } },
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: articles,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
      },
    };
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: { select: { username: true } } },
    });
    if (!article) {
      throw new NotFoundException(
        await this.i18n.translate('articles.article_not_found'),
      );
    }
    return article;
  }

  async update(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ) {
    await this.validateArticle(slug, userId);

    return this.prisma.article.update({
      where: { slug },
      data: updateArticleDto,
    });
  }

  async delete(slug: string, userId: number) {
    await this.validateArticle(slug, userId);

    return this.prisma.article.delete({ where: { slug } });
  }

  async favorite(slug: string, userId: number) {
    const article = await this.findBySlug(slug);
    const isFavorited = await this.validateFavorite(userId, article.id);

    if (isFavorited) {
      throw new BadRequestException('Bạn đã thích bài viết này');
    }

    const [favorite, updateArticle] = await this.prisma.$transaction([
      this.prisma.favorite.create({
        data: {
          userId: userId,
          articleId: article.id,
        },
      }),
      this.prisma.article.update({
        where: { id: article.id },
        data: {
          favoriteCount: {
            increment: 1,
          },
        },
        include: {
          author: {
            select: {
              username: true,
              bio: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return updateArticle;
  }

  async unfavorite(slug: string, userId: number) {
    const article = await this.findBySlug(slug);
    const isFavorited = await this.validateFavorite(userId, article.id);

    if (!isFavorited) {
      throw new BadRequestException('Bạn chưa thích bài viết này');
    }

    const [favorite, updateArticle] = await this.prisma.$transaction([
      this.prisma.favorite.delete({
        where: {
          userId_articleId: {
            userId: userId,
            articleId: article.id,
          },
        },
      }),
      this.prisma.article.update({
        where: { id: article.id },
        data: {
          favoriteCount: {
            decrement: 1,
          },
        },
        include: {
          author: {
            select: {
              username: true,
              bio: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return updateArticle;
  }

  private async validateFavorite(userId: number, articleId: number) {
    const isFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId: userId,
          articleId: articleId,
        },
      },
    });
    return isFavorite;
  }

  private async validateArticle(slug: string, userId: number) {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(
        this.i18n.translate('articles.article_not_found'),
      );
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException(
        this.i18n.translate('articles.can_not_pemission'),
      );
    }

    return article;
  }
}
