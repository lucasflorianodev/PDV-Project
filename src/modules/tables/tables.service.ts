import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------
  // CRUD de mesas
  // ---------------------------------------------------------------

  async create(dto: CreateTableDto, tenantId: string) {
    // Evita número de mesa duplicado no mesmo tenant
    const existing = await this.prisma.table.findUnique({
      where: { tenantId_number: { tenantId, number: dto.number } },
    });
    if (existing) throw new ConflictException('Número de mesa já cadastrado');

    return this.prisma.table.create({
      data: {
        tenantId,
        number: dto.number,
        status: dto.status ?? 'FREE', // Criada como livre por padrão
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.table.findMany({
      where: { tenantId },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        status: true,
        // Inclui sessão ativa se existir
        sessions: {
          where: { status: { in: ['OPEN', 'CHECKOUT_REQUESTED'] } },
          select: { id: true, status: true, openedAt: true },
          take: 1,
        },
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const table = await this.prisma.table.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        number: true,
        status: true,
        sessions: {
          where: { status: { in: ['OPEN', 'CHECKOUT_REQUESTED'] } },
          select: { id: true, status: true, openedAt: true },
          take: 1,
        },
      },
    });

    // Mesma resposta para "não existe" e "não autorizado" (anti-IDOR)
    if (!table) throw new BadRequestException();
    return table;
  }

  async update(id: string, dto: UpdateTableDto, tenantId: string) {
    const table = await this.prisma.table.findFirst({
      where: { id, tenantId },
    });
    if (!table) throw new BadRequestException();

    // Não permite alterar status manualmente para OCCUPIED
    // — isso é responsabilidade exclusiva do fluxo de pedidos
    if (dto.status === 'OCCUPIED') {
      throw new BadRequestException(
        'Status OCCUPIED é definido automaticamente pelo sistema',
      );
    }

    return this.prisma.table.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string, tenantId: string) {
    const table = await this.prisma.table.findFirst({
      where: { id, tenantId },
    });
    if (!table) throw new BadRequestException();

    // Bloqueia exclusão se houver ordem ativa
    const activeSession = await this.prisma.tableSession.findFirst({
      where: {
        tableId: id,
        status: { in: ['OPEN', 'CHECKOUT_REQUESTED'] },
      },
    });
    if (activeSession) {
      throw new ConflictException('Mesa possui ordem ativa e não pode ser excluída');
    }

    return this.prisma.table.delete({ where: { id } });
  }

  // ---------------------------------------------------------------
  // Controle de estado — chamados pelo fluxo de pedidos
  // ---------------------------------------------------------------

  /**
   * Abre uma sessão na mesa e marca como OCCUPIED.
   * Chamado quando uma ordem é criada.
   * Garante que só existe uma sessão ativa por mesa.
   */
  async openSession(tableId: string, userId: string, tenantId: string) {
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, tenantId },
      select: { id: true, status: true },
    });
    if (!table) throw new BadRequestException();

    // Garante que a mesa está livre antes de abrir
    if (table.status !== 'FREE') {
      throw new ConflictException('Mesa não está disponível');
    }

    // Transação: cria sessão + atualiza status da mesa atomicamente
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.tableSession.create({
        data: {
          tableId,
          tenantId,
          openedById: userId,
          status: 'OPEN',
        },
      });

      // Status da mesa reflete automaticamente o estado da ordem
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      });

      return session;
    });
  }

  /**
   * Solicita conferência — garçom pede a conta.
   */
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

  /**
   * Fecha a sessão e libera a mesa.
   * Chamado pelo PaymentsService após pagamento completo.
   */
  async closeSession(sessionId: string, tableId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.tableSession.update({
        where: { id: sessionId },
        data: { status: 'CLOSED', closedAt: new Date() },
      });

      // Mesa volta para FREE automaticamente
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'FREE' },
      });
    });
  }
}