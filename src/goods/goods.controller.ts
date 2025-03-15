import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { GoodsService } from './goods.service';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { Goods } from '../entities/goods.entity';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Apply guards only to POST
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGoodsDto: CreateGoodsDto): Promise<Goods> {
    return this.goodsService.create(createGoodsDto);
  }

  @Get()
  findAll(): Promise<Goods[]> {
    return this.goodsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt')) // Keep AuthGuard for GET /goods/:id (authenticated access)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Goods> {
    return this.goodsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoodsDto: UpdateGoodsDto,
  ): Promise<Goods> {
    return this.goodsService.update(id, updateGoodsDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.goodsService.remove(id);
  }
}
