import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Em produção: substituir por Redis com TTL
  private loginAttempts = new Map<string, { count: number; until?: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    this.checkLockout(email);

    // Hash dummy garante tempo de resposta constante (anti-enumeração)
    const user = await this.prisma.user.findUnique({ where: { email } });
    const dummyHash = '$2b$10$dummyhashfortimingnormalization00000000000';
    const hash = user?.passwordHash ?? dummyHash;

    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      this.recordFailure(email);
      // Mesma mensagem para usuário inexistente e senha errada
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.clearFailures(email);

    const payload = { sub: user.id, role: user.role, tenantId: user.tenantId };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    /*
     * DECISÃO DE PROJETO:
     * Em produção o refresh token seria gerado como string aleatória,
     * salvo como SHA-256 no banco, rotativo a cada uso, e revogável
     * via blacklist em Redis. O MFA (TOTP) seria exigido entre
     * a validação da senha e a emissão dos tokens.
     */

    return { accessToken, refreshToken };
  }

  private checkLockout(email: string) {
    const entry = this.loginAttempts.get(email);
    if (entry?.until && entry.until > new Date()) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  private recordFailure(email: string) {
    const entry = this.loginAttempts.get(email) ?? { count: 0 };
    entry.count++;
    if (entry.count >= 5) {
      entry.until = new Date(Date.now() + 15 * 60 * 1000);
    }
    this.loginAttempts.set(email, entry);
  }

  private clearFailures(email: string) {
    this.loginAttempts.delete(email);
  }
}