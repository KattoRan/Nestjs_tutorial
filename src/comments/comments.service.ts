import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    slug: string,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const article = await this.validateArticleSlug(slug);

    const [_, newComment] = await this.prisma.$transaction([
      this.prisma.article.update({
        where: { id: article.id },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      }),
      this.prisma.comment.create({
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
      }),
    ]);

    return {
      newComment,
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
      throw new NotFoundException(
        this.i18n.translate('comment.comment_not_found'),
      );
    }

    if (comment.authorId !== userId) {
      throw new BadRequestException(
        this.i18n.translate('comment.no_permission_delete_comment'),
      );
    }

    const [_, newComment] = await this.prisma.$transaction([
      this.prisma.article.update({
        where: { id: article.id },
        data: {
          commentsCount: {
            decrement: 1,
          },
        },
      }),
      this.prisma.comment.delete({
        where: { id: commentId },
      }),
    ]);

    return {
      newComment,
    };
  }

  private async validateArticleSlug(slug: string) {
    const article = await this.prisma.article.findUnique({ where: { slug } });

    if (!article) {
      throw new NotFoundException(
        this.i18n.translate('articles.article_not_found'),
      );
    }

    return article;
  }
}
