import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <-- Không cần import PrismaModule vào module nào cả
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- Export service
})
export class PrismaModule {}
