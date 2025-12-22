import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: 'prisma/migrations',
  },
  migrate: {
    async adapter() {
      const { createClient } = await import('@libsql/client')
      const { PrismaLibSql } = await import('@prisma/adapter-libsql')
      const libsql = createClient({ url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}` })
      return new PrismaLibSql(libsql as unknown as { url: string })
    },
  },
})
