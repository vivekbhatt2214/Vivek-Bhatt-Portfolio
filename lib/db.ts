import "dotenv/config";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  return new Pool({
    ...(connectionString ? { connectionString } : {
      host: process.env.DATABASE_HOST || "127.0.0.1",
      port: Number(process.env.DATABASE_PORT || 5432),
      user: process.env.DATABASE_USER || "postgres",
      password: process.env.DATABASE_PASSWORD || "",
      database: process.env.DATABASE_NAME || "portfolio_db",
    }),
    ssl: process.env.DATABASE_SSL === "true" || (process.env.NODE_ENV === "production" && connectionString)
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

export const db = globalForDb.pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = db;
