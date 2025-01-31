"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = __importDefault(require("pg"));
const node_postgres_1 = require("drizzle-orm/node-postgres");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { Pool } = pg_1.default;
const pool = new Pool({
    connectionString: process.env.DB_URL,
});
exports.db = (0, node_postgres_1.drizzle)(pool);
