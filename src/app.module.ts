import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CommentsModule } from './comments/comments.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ArticlesModule,
    CommentsModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n/'),
        watch: true,
      },
      resolvers: [
        {
          use: AcceptLanguageResolver,
          options: {
            matchType: 'strict',
          },
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
