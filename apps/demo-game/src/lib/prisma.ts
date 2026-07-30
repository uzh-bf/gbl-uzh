import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { PrismaClient } from 'src/generated/prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create PrismaClient')
  }

  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000,
  })

  return new PrismaClient({ adapter })
}

const client = globalThis.prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export default client
