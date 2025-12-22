import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import fs from 'node:fs'
import path from 'node:path'

// Use /tmp on Vercel (serverless), local file in development
const isVercel = process.env.VERCEL === '1'
const dbPath = isVercel ? '/tmp/dev.db' : path.join(process.cwd(), 'prisma', 'dev.db')
const dbUrl = `file:${dbPath}`

// Create libsql client for raw SQL execution (schema init)
const libsql = createClient({ url: dbUrl })

// Create Prisma adapter with the URL directly (Prisma 6.6.0+ API)
const adapter = new PrismaLibSql({ url: dbUrl })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  dbInitialized: boolean
}

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Initialize database schema and seed on first access (for serverless)
async function initializeDb() {
  if (globalForPrisma.dbInitialized) return

  // Check if database needs initialization
  const needsInit = isVercel && !fs.existsSync(dbPath)

  if (needsInit || isVercel) {
    // Read and execute schema SQL
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.sql')
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8')
      const statements = schemaSql.split(';').filter(s => s.trim())
      for (const stmt of statements) {
        if (stmt.trim()) {
          await libsql.execute(stmt)
        }
      }
    }

    // Seed the database
    const { seedDatabase } = await import('./seed-fn')
    await seedDatabase(prisma)
  }

  globalForPrisma.dbInitialized = true
}

export { initializeDb }
