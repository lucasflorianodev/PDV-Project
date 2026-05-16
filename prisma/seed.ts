import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '00000000-0000-4000-a000-000000000001';

  const hash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@cafearoma.com' },
    update: {},
    create: {
      email: 'admin@cafearoma.com',
      passwordHash: hash,
      role: 'ADMIN',
      tenantId,
    },
  });

  // Cria as 20 mesas do frontend
  for (let i = 1; i <= 20; i++) {
    await prisma.table.upsert({
      where: { tenantId_number: { tenantId, number: i } },
      update: {},
      create: { tenantId, number: i, status: 'FREE' },
    });
  }

  // Cria os produtos do catálogo
  const produtos = [
    { name: 'Espresso G',           priceCents: 1000 },
    { name: 'Cappuccino G',         priceCents: 1400 },
    { name: 'Latte Aveia G',        priceCents: 1500 },
    { name: 'Mocha G',              priceCents: 1400 },
    { name: 'Frappuccino Caramelo', priceCents: 1600 },
    { name: 'Croissant Chocolate',  priceCents: 1100 },
    { name: 'Muffin Mirtilo',       priceCents:  900 },
    { name: 'Pão de Queijo (2un)',  priceCents:  800 },
    { name: 'Brownie Avelã',        priceCents: 1000 },
    { name: 'Torrada Amanteigada',  priceCents:  600 },
  ];

  for (const p of produtos) {
    await prisma.product.upsert({
      where: { id: p.name } as any,
      update: {},
      create: { ...p, tenantId, isActive: true, isAvailable: true },
    }).catch(() =>
      prisma.product.create({ data: { ...p, tenantId, isActive: true, isAvailable: true } })
    );
  }

  console.log('Seed concluído!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());