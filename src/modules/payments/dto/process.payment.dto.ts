import { IsUUID, IsEnum, IsInt, Min } from 'class-validator';

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
}

export class ProcessPaymentDto {
  @IsUUID('4')
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsInt()
  @Min(1)
  amountCents: number;
}