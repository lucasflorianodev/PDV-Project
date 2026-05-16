<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="80" alt="Nest Logo" />
  </a>
</p>

# ☕ Café Aroma — Sistema de PDV & Gestão de Mesas

Este repositório contém a solução Full-Stack para o **Café Aroma**, um sistema de Ponto de Venda (PDV) e gerenciamento de mesas e pedidos. O projeto combina um Back-end robusto focado em segurança defensiva com um Front-end Vanilla leve, simulando a operação em tempo real de uma cafeteria.

---

## 🏗️ Arquitetura do Projeto

O ecossistema é dividido em duas partes principais:

1. **Back-end (API):** Desenvolvido em NestJS, focado em segurança defensiva, consistência transacional, controle de acesso estrito e arquitetura escalável.
2. **Front-end (Client):** Uma interface Single Page Application (SPA) construída com HTML5, CSS3 e JavaScript puro (sem frameworks ou dependências externas), garantindo alta performance e renderização ágil no ecossistema do salão.

---

## 🛠️ Tech Stack

### Back-end
- **Runtime:** Node.js v24
- **Framework:** NestJS 11
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL 16
- **Autenticação:** Passport.js + JWT

### Front-end
- **Linguagem:** JavaScript (ES6+) Puro / Vanilla JS
- **Estilização:** CSS3 Moderno
- **Estrutura:** HTML5 Semântico

---

## 🗂️ Estrutura de Arquivos (Front-end)

cafe-aroma/
├── index.html   → Estrutura HTML da aplicação
├── style.css    → Estilos, variáveis de cor e layout visual
├── data.js      → Mock de dados das mesas e catálogo de produtos
├── app.js       → Lógica da aplicação (renderização, estado e eventos)
└── logo.jpeg    → Logotipo do Café Aroma

---

## 🚀 Módulos & Funcionalidades

### Gestão do Salão e PDV (Front-end)
- **Mapa de Mesas:** Controle visual de 20 mesas com 3 status dinâmicos:
  - 🟤 **Ocupada** — Mesa com pedido em andamento.
  - 🟦 **Livre** — Mesa disponível.
  - 🟠 **Parcial** — Mesa com consumo iniciado/conferência solicitada.
- **Filtros Avançados:** Filtragem rápida por status da mesa e por atendente responsável.
- **Painel de Pedidos:** Listagem detalhada de itens consumidos, cálculo automático de subtotal e total.
- **Modal de Produtos:** Adição rápida de itens ao catálogo da mesa selecionada.
- **Modal de Funções:** Ações operacionais como cancelar pedido, transferir mesa, aplicar desconto e fechar conta.
- **Observações:** Campo de texto dinâmico por pedido para customizações (ex: "Sem açúcar", "Com gelo").
- **Feedbacks:** Sistema de Toasts para notificações de sucesso ou erro em tempo real.

### Regras de Negócio & Core (Back-end)
- **Auth:** Autenticação segura com JWT, proteção contra brute force e tempo de resposta constante.
- **Users:** Gerenciamento de usuários com controle de níveis de acesso (RBAC): ADMIN, MANAGER, WAITER, CASHIER.
- **Products:** Catálogo de produtos com controle de disponibilidade em estoque e soft delete.
- **Tables:** Ciclo de vida completo das mesas (FREE, OCCUPIED, RESERVED) integrado nativamente ao fluxo de pedidos.
- **Orders:** Criação e cancelamento de pedidos blindados com snapshot de preço (evita alteração retroativa de valores).
- **Payments:** Liquidação financeira com controle de idempotência e suporte a pagamentos parciais.
- **Stock:** Controle de estoque rígido com dedução atômica diretamente na confirmação do pagamento.

---

## 🛡️ Segurança Aplicada (Back-end Defensivo)

- **Tokens Securos:** JWT com access token de curta duração (15 min) e refresh token rotativo armazenado de forma segura.
- **Proteção contra IDOR:** O identificador do lojista (tenantId) é extraído diretamente do JWT verificado, nunca aceito pelo corpo (body) da requisição.
- **Sanitização de Dados:** ValidationPipe global configurado com whitelist: true e forbidNonWhitelisted: true para bloquear payloads maliciosos.
- **Ofuscação de Dados:** Uso exclusivo de UUIDs v4 em todos os identificadores públicos expostos na API.
- **Proteção de Camada:** Implementação do Helmet para injeção de headers de segurança e CORS estritamente restrito à origem configurada.
- **Mecanismos Anti-Brute-Force:** Sistema de lockout progressivo (bloqueio de 15 minutos após 5 tentativas falhas).
- **Anti-Enumeração:** Tempo de resposta constante no endpoint de login para mitigar ataques de enumeração de usuários.
- **Tratamento de Exceções:** Respostas genéricas de erro para o cliente sem qualquer exposição de stack trace.

---

## ⚙️ Pré-requisitos

Para rodar o ecossistema localmente, você precisará de:
- Node.js 22+
- Docker (para instanciar o PostgreSQL)
- Gerenciador de pacotes npm

---

## 🔧 Configuração do Ambiente

1 — Clone o repositório:
```bash
git clone [https://github.com/lucasflorianodev/PDV-Project.git](https://github.com/lucasflorianodev/PDV-Project.git)
cd PDV-Project
