import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async open(tableId: string, userId: string, tenantId: string) {
    // Verifica se a mesa pertence ao tenant (anti-IDOR)
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, tenantId },
    });
    if (!table) throw new BadRequestException();

    // Verifica se já há sessão aberta
    const existing = await this.prisma.tableSession.findFirst({
      where: { tableId, tenantId, status: { in: ['OPEN', 'CHECKOUT_REQUESTED'] } },
    });
    if (existing) throw new ConflictException('Mesa já está aberta');

    return this.prisma.tableSession.create({
      data: { tableId, tenantId, openedById: userId },
    });
  }

  async requestCheckout(sessionId: string, tenantId: string) {
    const session = await this.prisma.tableSession.findFirst({
      where: { id: sessionId, tenantId, status: 'OPEN' },
    });
    if (!session) throw new BadRequestException();

    return this.prisma.tableSession.update({
      where: { id: sessionId },
      data: { status: 'CHECKOUT_REQUESTED' },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.tableSession.findMany({
      where: { tenantId, status: { in: ['OPEN', 'CHECKOUT_REQUESTED'] } },
      include: { table: true },
    });
  }
}