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

  findAll() {
    return this.prisma.article.findMany({
      include: { author: { select: { username: true } } },
    });
  }

  findDrafts(authorId: number) {
    return this.prisma.article.findMany({
      where: { authorId: authorId },
      include: { author: { select: { username: true } } },
    });
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

  async update(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ) {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(`Không tìm thấy bài viết.`);
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết!');
    }

    return this.prisma.article.update({
      where: { slug },
      data: updateArticleDto,
    });
  }

  async delete(slug: string, userId: number) {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(`Không tìm thấy bài viết.`);
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xoá bài viết!');
    }

    return this.prisma.article.delete({ where: { slug } });
  }
}
