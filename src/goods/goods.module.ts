import { Module } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { GoodsController } from './goods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goods } from '../entities/goods.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goods]), AuthModule, UsersModule],
  controllers: [GoodsController],
  providers: [GoodsService],
})
export class GoodsModule {}
