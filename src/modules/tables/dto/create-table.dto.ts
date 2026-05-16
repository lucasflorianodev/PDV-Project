import { IsInt, IsOptional, IsEnum, Min, Max } from 'class-validator';

export enum TableStatus {
  FREE = 'FREE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
}

export class CreateTableDto {
  @IsInt()
  @Min(1)
  @Max(999)
  number: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}