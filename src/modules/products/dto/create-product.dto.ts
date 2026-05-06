import {
  IsString, IsInt, IsOptional,
  IsBoolean, Min, Max, Length,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  description?: string;

  @IsInt()
  @Min(1)         // Valor em centavos — nunca zero ou negativo
  @Max(9999999)   // Limite: R$ 99.999,99
  priceCents: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}