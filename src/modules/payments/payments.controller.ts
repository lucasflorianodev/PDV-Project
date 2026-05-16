import {
  Controller, Post, Get, Body,
  Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
  tenantId: string;
}

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @Roles('ADMIN', 'CASHIER')
  process(
    @Body() dto: ProcessPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.process(dto, user.id, user.tenantId);
  }

  @Get('order/:orderId')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  findByOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.findByOrder(orderId, user.tenantId);
  }
}