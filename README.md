<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

# PDV System — Back-end

Back-end de um sistema de gestão de salão e PDV (Ponto de Venda) desenvolvido como trabalho de conclusão de curso. O projeto foi construído com foco em segurança defensiva, consistência transacional e boas práticas de arquitetura.

---

## Stack

- **Runtime:** Node.js v24
- **Framework:** NestJS 11
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de dados:** PostgreSQL 16
- **Autenticação:** Passport.js + JWT

---

## Módulos implementados

- **Auth** — autenticação com JWT, proteção contra brute force e tempo de resposta constante
- **Users** — gerenciamento de usuários com controle de roles (ADMIN, MANAGER, WAITER, CASHIER)
- **Products** — catálogo de produtos com controle de disponibilidade e soft delete
- **Tables** — ciclo de vida de mesas (FREE, OCCUPIED, RESERVED) integrado ao fluxo de pedidos
- **Orders** — criação e cancelamento de pedidos com snapshot de preço
- **Payments** — liquidação financeira com idempotência e pagamentos parciais
- **Stock** — controle de estoque com dedução atômica após pagamento

---

## Segurança aplicada

- JWT com access token de curta duração (15 min) e refresh token rotativo
- RBAC em todos os endpoints via `RolesGuard`
- Proteção contra IDOR: `tenantId` extraído do JWT, nunca do body
- `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted`
- UUIDs v4 em todos os identificadores públicos
- Helmet com headers de segurança
- CORS restrito à origem configurada
- Anti-brute-force com lockout progressivo de 15 minutos após 5 tentativas
- Tempo de resposta constante no login (anti-enumeração)
- Respostas genéricas sem exposição de stack trace

---

## Pré-requisitos

- Node.js 22+ 
- Docker (para o PostgreSQL)
- npm

---

## Configuração do ambiente

**1 — Clone o repositório:**

```bash
git clone https://github.com/lucasflorianodev/PDV-Project.git
cd PDV-Project
```

**2 — Instale as dependências:**

```bash
npm install
```

**3 — Configure as variáveis de ambiente:**

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações.

**4 — Suba o banco de dados:**

```bash
docker run --name pdv-postgres \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_DB=pdv_dev \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  -d postgres:16
```

**5 — Execute as migrations:**

```bash
npx prisma migrate dev
```

**6 — Inicie o servidor:**

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000/api/v1`.

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NODE_ENV` | Ambiente (`development` ou `production`) |
| `PORT` | Porta do servidor (padrão: 3000) |
| `DATABASE_URL` | URL de conexão com o PostgreSQL |
| `JWT_ACCESS_SECRET` | Segredo do access token (mín. 32 caracteres) |
| `JWT_REFRESH_SECRET` | Segredo do refresh token (mín. 32 caracteres) |
| `ALLOWED_ORIGIN` | Origem permitida no CORS |

---

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/v1/auth/login` | Autenticação |
| GET | `/api/v1/products` | Listar produtos |
| POST | `/api/v1/products` | Criar produto |
| GET | `/api/v1/tables` | Listar mesas |
| POST | `/api/v1/tables` | Criar mesa |
| POST | `/api/v1/tables/:id/session` | Abrir sessão na mesa |
| PATCH | `/api/v1/tables/session/:id/checkout` | Solicitar conferência |
| POST | `/api/v1/orders` | Criar pedido |
| PATCH | `/api/v1/orders/:id/cancel` | Cancelar pedido |
| POST | `/api/v1/payments` | Processar pagamento |
| GET | `/api/v1/payments/order/:id` | Consultar pagamentos de uma ordem |

---

## Scripts disponíveis

```bash
# Desenvolvimento com hot-reload
npm run start:dev

# Build de produção
npm run build

# Produção
npm run start:prod

# Testes
npm run test
```

---

## Licença

Projeto acadêmico — uso educacional.
