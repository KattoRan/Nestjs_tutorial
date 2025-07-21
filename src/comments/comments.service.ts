import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    slug: string,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const article = await this.validateArticleSlug(slug);

    const comment = await this.prisma.comment.create({
      data: {
        body: createCommentDto.body,
        author: {
          connect: { id: userId },
        },
        article: {
          connect: { id: article.id },
        },
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            username: true,
            bio: true,
            avatar: true,
          },
        },
      },
    });

    return {
      comment,
    };
  }

  async findComments(slug: string) {
    const article = await this.validateArticleSlug(slug);

    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      select: {
        id: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            username: true,
            bio: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      comments: [...comments],
    };
  }

  async delete(slug: string, commentId: number, userId: number) {
    const article = await this.validateArticleSlug(slug);

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận.');
    }

    if (comment.authorId !== userId) {
      throw new BadRequestException('Bạn không có quyền xoá bình luận này');
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  private async validateArticleSlug(slug: string) {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(`Không tìm thấy bài viết.`);
    }

    return article;
  }
}
