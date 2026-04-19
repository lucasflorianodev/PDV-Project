import {
  IsUUID, IsArray, ValidateNested,
  IsInt, Min, Max, IsString, Length, IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID('4')
  productId: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  notes?: string;
}

export class CreateOrderDto {
  @IsUUID('4')
  tableSessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}