import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Sobrescreve apenas para normalizar a resposta de erro
  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException();
    return user;
  }
}