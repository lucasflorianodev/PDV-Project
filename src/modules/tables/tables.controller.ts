import {
  Controller, Post, Get, Patch, Param,
  Body, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TablesService } from './tables.service';
import { OpenTableDto } from './dto/open-table.dto';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER', 'WAITER', 'CASHIER')
  findAll(@CurrentUser() user: any) {
    return this.tablesService.findAll(user.tenantId);
  }

  @Post('open')
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  open(@Body() dto: OpenTableDto, @CurrentUser() user: any) {
    return this.tablesService.open(dto.tableId, user.id, user.tenantId);
  }

  @Patch(':id/checkout')
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  requestCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.requestCheckout(id, user.tenantId);
  }
}