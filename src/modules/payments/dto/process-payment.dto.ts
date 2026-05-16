import {
  IsUUID, IsEnum, IsInt, IsString, Min, MaxLength,
} from 'class-validator';

export enum PaymentMethod {
  CASH        = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD  = 'DEBIT_CARD',
  PIX         = 'PIX',
}

export class ProcessPaymentDto {
  @IsUUID('4')
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsInt()
  @Min(1) // Valor em centavos — nunca zero
  amountCents: number;

  @IsString()
  @IsUUID('4')
  idempotencyKey: string; // UUID gerado pelo cliente — garante unicidade da operação
}