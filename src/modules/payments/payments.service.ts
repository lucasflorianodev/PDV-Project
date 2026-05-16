import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async process(dto: ProcessPaymentDto, actorId: string, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {

      // --- Idempotência ---
      // Se a chave já existe, retorna o resultado anterior sem reprocessar
      const existing = await tx.payment.findFirst({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        /*
         * DECISÃO DE PROJETO:
         * Retorna o pagamento já processado em vez de erro.
         * Protege contra double-submit, retry automático de rede
         * e tentativas duplicadas do cliente.
         */
        return {
          paymentId: existing.id,
          status: existing.status,
          fullyPaid: false, // Não reprocessa — apenas confirma recebimento
          duplicate: true,
        };
      }

      // --- Valida ownership da ordem (anti-IDOR) ---
      const order = await tx.order.findFirst({
        where: { id: dto.orderId, tenantId, status: 'OPEN' },
        include: { tableSession: true },
      });
      if (!order) throw new BadRequestException();

      // Regra de negócio: só paga após solicitar conferência
      if (order.tableSession.status !== 'CHECKOUT_REQUESTED') {
        throw new ConflictException('Conferência não solicitada');
      }

      const saldoDevedor = order.totalCents - order.paidAmountCents;
      if (dto.amountCents > saldoDevedor) {
        throw new BadRequestException('Valor excede o saldo devedor');
      }

      // --- Registra pagamento como PENDING primeiro ---
      // Em integração com gateway: ficaria PENDING até confirmação assíncrona
      const payment = await tx.payment.create({
        data: {
          orderId:        order.id,
          method:         dto.method,
          amountCents:    dto.amountCents,
          status:         'PENDING',
          idempotencyKey: dto.idempotencyKey,
          tenantId,
          createdById:    actorId,
        },
      });

      const totalPaid = order.paidAmountCents + dto.amountCents;
      const fullyPaid = totalPaid >= order.totalCents;

      // --- Confirma pagamento como PAID ---
      // Em produção com gateway: esse update viria via webhook, não aqui
      await tx.payment.update({
        where: { id: payment.id },
        data:  { status: 'PAID' },
      });

      if (fullyPaid) {
        // Quita a ordem
        await tx.order.update({
          where: { id: order.id },
          data:  { status: 'PAID', paidAmountCents: totalPaid },
        });

        // Fecha sessão e libera mesa atomicamente
        await tx.tableSession.update({
          where: { id: order.tableSession.id },
          data:  { status: 'CLOSED', closedAt: new Date() },
        });

        await tx.table.update({
          where: { id: order.tableSession.tableId },
          data:  { status: 'FREE' },
        });

        // Deduz estoque
        const items = await tx.orderItem.findMany({
          where: { orderId: order.id },
        });

        for (const item of items) {
          await tx.stock.updateMany({
            where: {
              productId: item.productId,
              tenantId,
              quantity: { gte: item.quantity },
            },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      } else {
        // Pagamento parcial — atualiza valor pago na ordem
        await tx.order.update({
          where: { id: order.id },
          data:  { paidAmountCents: totalPaid },
        });
      }

      // Log de auditoria — em produção iria para SIEM
      console.log(JSON.stringify({
        event:       'PAYMENT_PROCESSED',
        orderId:     order.id,
        paymentId:   payment.id,
        actorId,
        amountCents: dto.amountCents,
        status:      'PAID',
        fullyPaid,
        ts:          new Date().toISOString(),
      }));

      return { paymentId: payment.id, status: 'PAID', fullyPaid, duplicate: false };
    });
  }

  async findByOrder(orderId: string, tenantId: string) {
    // Valida ownership antes de retornar (anti-IDOR)
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new BadRequestException();

    return this.prisma.payment.findMany({
      where: { orderId, tenantId },
      select: {
        id:          true,
        method:      true,
        amountCents: true,
        status:      true,
        createdAt:   true,
        // Nunca expõe idempotencyKey, gatewayRef ou IDs internos
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}