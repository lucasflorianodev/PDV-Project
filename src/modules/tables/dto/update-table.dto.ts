import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { TableStatus } from './create-table.dto';

export class UpdateTableDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  number?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}