// Simple PostgreSQL connectivity check for production
// Loads env from .env.production by default (or .env if not in prod)

const { Client } = require('pg')
const path = require('path')

// Resolve env file
const envPath =
  process.env.ENV_FILE ||
  (process.env.NODE_ENV === 'production' ? '.env.production' : '.env')

try {
  require('dotenv').config({ path: path.resolve(process.cwd(), envPath) })
} catch (e) {
  console.warn(
    `⚠️ Could not load env file at ${envPath}. Proceeding with process.env...`,
  )
}

const useSSL = String(process.env.DB_SSL || '').toLowerCase() === 'true'
const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT || 10000),
}

async function main() {
  const start = Date.now()
  const client = new Client(config)
  console.log('🔌 Connecting to PostgreSQL...', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    ssl: !!config.ssl,
  })

  try {
    await client.connect()
    const res = await client.query('SELECT 1 AS ok')
    const ms = Date.now() - start
    console.log(`✅ DB connection OK ( ${ms}ms )`, res.rows[0])
    process.exit(0)
  } catch (err) {
    console.error('❌ DB connection FAILED:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    try {
      await client.end()
    } catch {}
  }
}

main()
