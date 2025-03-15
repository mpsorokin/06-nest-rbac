import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGoodsDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number) // Needed for validation pipe to work correctly with numbers from request body
  readonly price!: number;
}
