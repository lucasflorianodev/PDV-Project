import {
  Injectable, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process.payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async process(dto: ProcessPaymentDto, actorId: string, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Valida ownership (anti-IDOR) e busca a ordem
      const order = await tx.order.findFirst({
        where: { id: dto.orderId, tenantId, status: 'OPEN' },
        include: { tableSession: true },
      });
      if (!order) throw new BadRequestException();

      // Regra de negócio: só paga após solicitar conferência
      if (order.tableSession.status !== 'CHECKOUT_REQUESTED') {
        throw new ConflictException('Conferência não solicitada');
      }

      if (dto.amountCents > order.totalCents - order.paidAmountCents) {
        throw new BadRequestException('Valor excede o saldo devedor');
      }

      const payment = await tx.payment.create({
        data: {orderId: order.id, method: dto.method, amountCents: dto.amountCents, tenantId, createdById: actorId},
      });

      const totalPaid = order.paidAmountCents + dto.amountCents;
      const fullyPaid = totalPaid >= order.totalCents;

      if (fullyPaid) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID', paidAmountCents: totalPaid },
        });

        await tx.tableSession.update({
          where: { id: order.tableSession.id },
          data: { status: 'CLOSED', closedAt: new Date() },
        });

        // Deduz estoque — constraint no banco impede quantidade negativa
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
        await tx.order.update({
          where: { id: order.id },
          data: { paidAmountCents: totalPaid },
        });
      }

      console.log(JSON.stringify({
        event: 'PAYMENT_PROCESSED',
        orderId: order.id,
        actorId,
        amountCents: dto.amountCents,
        fullyPaid,
        ts: new Date().toISOString(),
      }));

      return { paymentId: payment.id, fullyPaid };
    });
  }
}