import path from 'node:path';
import { PrismaClient } from '@prisma/client';

// Resolve relative file: URLs so Prisma finds the DB from project root (CLI uses prisma/dev.db)
const raw = process.env.DATABASE_URL;
if (raw?.startsWith('file:./')) {
  const name = raw.replace(/^file:\.\/+/, '') || 'dev.db';
  const dir = name.includes('/') ? path.dirname(name) : 'prisma';
  const file = name.includes('/') ? path.basename(name) : name;
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), dir, file)}`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
