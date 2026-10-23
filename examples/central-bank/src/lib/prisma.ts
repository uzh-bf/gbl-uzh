import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import { PrismaClient } from 'src/generated/prisma/client'

const nodeEnvironment = process.env.NODE_ENV ?? 'development'
config({
  path: [
    `.env.${nodeEnvironment}.local`,
    ...(nodeEnvironment === 'test' ? [] : ['.env.local']),
    `.env.${nodeEnvironment}`,
    '.env',
  ],
  quiet: true,
})

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create PrismaClient')
  }

  const adapter = new PrismaPg(connectionString)

  return new PrismaClient({ adapter })
}

const client = globalThis.prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export default client
