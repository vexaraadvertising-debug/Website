"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("<My Database Password>")
    ? process.env.DATABASE_URL
    : process.env.DIRECT_URL && !process.env.DIRECT_URL.includes("<My Database Password>")
        ? process.env.DIRECT_URL
        : "postgresql://postgres:postgres@localhost:5432/orinko";
const globalForPrisma = globalThis;
function createPrismaClient() {
    const pool = new pg_1.Pool({ connectionString });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    return new client_1.PrismaClient({ adapter, log: ["error"] });
}
exports.prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
