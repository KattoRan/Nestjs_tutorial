import {
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

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

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
      throw new ConflictException('Bài viết với tiêu đề này đã tồn tại');
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
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [total, articles] = await this.prisma.$transaction([
      this.prisma.article.count(),
      this.prisma.article.findMany({
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
    const { page = 1, limit = 10 } = paginationDto;
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
      throw new NotFoundException(`Không tìm thấy bài viết.`);
    }
    return article;
  }

  private async validateArticleAccess(slug: string, userId: number) {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(`Không tìm thấy bài viết.`);
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này!',
      );
    }

    return article;
  }

  async update(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ) {
    await this.validateArticleAccess(slug, userId);

    return this.prisma.article.update({
      where: { slug },
      data: updateArticleDto,
    });
  }

  async delete(slug: string, userId: number) {
    await this.validateArticleAccess(slug, userId);

    return this.prisma.article.delete({ where: { slug } });
  }
}
