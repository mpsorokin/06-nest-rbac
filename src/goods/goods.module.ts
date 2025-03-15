import { Module } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { GoodsController } from './goods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goods } from '../entities/goods.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule to use AuthGuard

@Module({
  imports: [TypeOrmModule.forFeature([Goods]), AuthModule, UsersModule], // Import TypeOrmModule and AuthModule
  controllers: [GoodsController],
  providers: [GoodsService],
})
export class GoodsModule {}
