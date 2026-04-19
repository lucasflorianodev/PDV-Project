import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Em produção: substituir por Redis com TTL automático
  private loginAttempts = new Map<string, { count: number; until?: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    // 1. Lockout simples por e-mail
    this.checkLockout(email);

    // 2. Busca usuário — hash dummy garante tempo constante mesmo se não existir
    //    (anti-enumeração: mesma resposta para "não existe" e "senha errada")
    const user = await this.prisma.user.findUnique({ where: { email } });
    const dummyHash = '$2b$10$dummyhashfortimingnormalization00000000000';
    const hash = user?.passwordHash ?? dummyHash;

    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      this.recordFailure(email);
      // Resposta genérica — nunca diz "usuário não existe" ou "senha errada"
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.clearFailures(email);

    // 3. Access token curto (15min) + refresh token simples
    const payload = { sub: user.id, role: user.role };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });

    // Refresh token: em produção seria rotativo e armazenado no banco
    // Para o TCC: token de longa duração salvo como HttpOnly cookie basta demonstrar o conceito
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };

    /*
     * DECISÃO DE PROJETO (para a monografia):
     * Em produção, o refresh token seria:
     *  - Gerado como string aleatória (não JWT), salvo como SHA-256 no banco
     *  - Rotativo: cada uso gera um novo e invalida o anterior
     *  - Revogável server-side via blacklist em Redis
     * O MFA (TOTP com Google Authenticator) seria adicionado entre os passos 2 e 3.
     */
  }

  // --- Anti-brute-force em memória (simples, suficiente para TCC) ---
  private checkLockout(email: string) {
    const entry = this.loginAttempts.get(email);
    if (entry?.until && entry.until > new Date()) {
      throw new UnauthorizedException('Credenciais inválidas'); // Mesma mensagem
    }
  }

  private recordFailure(email: string) {
    const entry = this.loginAttempts.get(email) ?? { count: 0 };
    entry.count++;
    if (entry.count >= 5) {
      entry.until = new Date(Date.now() + 15 * 60 * 1000); // 15min de lockout
    }
    this.loginAttempts.set(email, entry);
  }

  private clearFailures(email: string) {
    this.loginAttempts.delete(email);
  }
}