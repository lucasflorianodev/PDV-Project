import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(dto, user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'WAITER', 'CASHIER')
  findAll(
    @CurrentUser() user: any,
    @Query('available') available?: string,
  ) {
    // Garçom e caixa só veem produtos disponíveis
    const onlyAvailable =
      available === 'true' || ['WAITER', 'CASHIER'].includes(user.role);
    return this.productsService.findAll(user.tenantId, onlyAvailable);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'WAITER', 'CASHIER')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.productsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')   // Apenas admin pode remover produtos
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.productsService.remove(id, user.tenantId);
  }
}