import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goods } from '../entities/goods.entity';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(Goods)
    private goodsRepository: Repository<Goods>,
  ) {}

  async create(createGoodsDto: CreateGoodsDto): Promise<Goods> {
    const good = this.goodsRepository.create(createGoodsDto);
    return this.goodsRepository.save(good);
  }

  async findAll(): Promise<Goods[]> {
    return this.goodsRepository.find();
  }

  async findOne(id: number): Promise<Goods> {
    const good = await this.goodsRepository.findOne({ where: { id } });
    if (!good) {
      throw new NotFoundException(`Good with ID "${id}" not found`);
    }
    return good;
  }

  async update(id: number, updateGoodsDto: UpdateGoodsDto): Promise<Goods> {
    const good = await this.findOne(id); // Ensure good exists
    this.goodsRepository.merge(good, updateGoodsDto);
    return this.goodsRepository.save(good);
  }

  async remove(id: number): Promise<void> {
    const good = await this.findOne(id); // Ensure good exists
    await this.goodsRepository.remove(good);
  }
}
