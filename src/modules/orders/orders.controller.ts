import {
  Controller, Post, Get, Patch, Body,
  Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles('ADMIN', 'WAITER')
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(dto, user.id, user.tenantId);
  }

  @Get('session/:sessionId')
  @Roles('ADMIN', 'MANAGER', 'WAITER', 'CASHIER')
  findBySession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.findBySession(sessionId, user.tenantId);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN', 'MANAGER')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.cancel(id, user.id, user.tenantId);
  }
}