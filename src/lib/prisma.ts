// @ts-ignore
import Prisma from '@prisma/client';

// @ts-ignore
const PrismaClient = Prisma.PrismaClient || Prisma.default?.PrismaClient;

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;