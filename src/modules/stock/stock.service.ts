import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.stock.findMany({
      where: { tenantId },
      include: { product: true },
    });
  }

  async adjust(productId: string, quantity: number, tenantId: string) {
    if (quantity < 0) throw new BadRequestException('Quantidade não pode ser negativa');

    return this.prisma.stock.upsert({
      where: { productId },
      update: { quantity },
      create: { productId, tenantId, quantity },
    });
  }
}