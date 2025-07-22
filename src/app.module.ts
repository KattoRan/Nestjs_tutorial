import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CommentsModule } from './comments/comments.module';
import { I18nModule } from 'nestjs-i18n';
import { i18nConfig } from './config/i18n.config';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ArticlesModule,
    CommentsModule,
    I18nModule.forRoot(i18nConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
