import {
  Injectable, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string, tenantId: string) {
    // Valida que a sessão pertence ao tenant (anti-IDOR)
    const session = await this.prisma.tableSession.findFirst({
      where: { id: dto.tableSessionId, tenantId, status: 'OPEN' },
    });
    if (!session) throw new BadRequestException();

    // Busca produtos e calcula total dentro de uma transação
    return this.prisma.$transaction(async (tx) => {
      let totalCents = 0;
      const itemsData = [];

      for (const item of dto.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId, isActive: true },
        });
        if (!product) throw new BadRequestException(`Produto não encontrado`);

        const subtotal = product.priceCents * item.quantity;
        totalCents += subtotal;

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitCents: product.priceCents,
          notes: item.notes,
        });
      }

      return tx.order.create({
        data: {
          tenantId,
          tableSessionId: dto.tableSessionId,
          totalCents,
          createdById: userId,
          items: { create: itemsData },
        },
        include: { items: true },
      });
    });
  }

  async cancel(orderId: string, userId: string, tenantId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, status: 'OPEN' },
    });
    if (!order) throw new BadRequestException();

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    // Log de auditoria — em produção iria para SIEM
    console.log(JSON.stringify({
      event: 'ORDER_CANCELLED',
      orderId,
      actorId: userId,
      tenantId,
      ts: new Date().toISOString(),
    }));

    return updated;
  }

  async findBySession(sessionId: string, tenantId: string) {
    return this.prisma.order.findMany({
      where: { tableSessionId: sessionId, tenantId },
      include: { items: { include: { product: true } } },
    });
  }
}