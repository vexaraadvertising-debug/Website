import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("<My Database Password>")
    ? process.env.DATABASE_URL
    : process.env.DIRECT_URL && !process.env.DIRECT_URL.includes("<My Database Password>")
    ? process.env.DIRECT_URL
    : "postgresql://postgres:postgres@localhost:5432/orinko";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ["error"] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
