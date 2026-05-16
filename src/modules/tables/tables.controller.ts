import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  create(@Body() dto: CreateTableDto, @CurrentUser() user: any) {
    return this.tablesService.create(dto, user.tenantId);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'WAITER', 'CASHIER')
  findAll(@CurrentUser() user: any) {
    return this.tablesService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'WAITER', 'CASHIER')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.remove(id, user.tenantId);
  }

  @Post(':id/session')
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  openSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.openSession(id, user.id, user.tenantId);
  }

  @Patch('session/:sessionId/checkout')
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  requestCheckout(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.tablesService.requestCheckout(sessionId, user.tenantId);
  }
}