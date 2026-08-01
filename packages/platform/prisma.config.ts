import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const databaseUrl = process.env.DATABASE_URL

export default defineConfig({
  schema: 'public/schema.prisma',
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
})
