import {
  IsString, IsInt, IsOptional,
  IsBoolean, Min, Max, Length,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999999)
  priceCents?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}