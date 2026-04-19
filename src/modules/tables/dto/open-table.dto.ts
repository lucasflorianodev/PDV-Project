import { IsUUID } from 'class-validator';

export class OpenTableDto {
  @IsUUID('4')
  tableId: string;
}