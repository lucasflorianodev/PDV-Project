import {
  Injectable, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto, tenantId: string) {
    // Evita duplicidade de nome dentro do mesmo tenant
    const existing = await this.prisma.product.findFirst({
      where: { name: dto.name, tenantId, isActive: true },
    });
    if (existing) throw new ConflictException('Produto já cadastrado');

    return this.prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        priceCents: dto.priceCents,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async findAll(tenantId: string, onlyAvailable?: boolean) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true, // Nunca retorna soft-deleted
        ...(onlyAvailable ? { isAvailable: true } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        isAvailable: true,
        // Nunca expõe tenantId ou campos internos
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        isAvailable: true,
      },
    });

    // Mesma resposta para "não existe" e "não autorizado" (anti-IDOR)
    if (!product) throw new BadRequestException();
    return product;
  }

  async update(id: string, dto: UpdateProductDto, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!product) throw new BadRequestException();

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priceCents && { priceCents: dto.priceCents }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        isAvailable: true,
      },
    });

    /*
     * DECISÃO DE PROJETO:
     * A alteração de preço aqui não afeta ordens antigas pois o OrderItem
     * armazena unitCents no momento da adição (snapshot). Isso garante
     * a imutabilidade do preço dentro de ordens já criadas.
     */
  }

  async remove(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!product) throw new BadRequestException();

    // Verifica se o produto está em alguma ordem aberta
    const inUse = await this.prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: { status: 'OPEN' },
      },
    });
    if (inUse) throw new ConflictException('Produto está em uso em uma ordem aberta');

    // Soft delete — nunca remove fisicamente
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false, isAvailable: false },
    });
  }
}