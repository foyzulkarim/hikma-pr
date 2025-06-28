import { PrismaClient } from '@prisma/client'
import { setupDatabaseConfig } from '../config/databaseConfig'

// Setup database configuration before initializing Prisma
setupDatabaseConfig();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
