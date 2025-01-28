import { drizzle } from 'drizzle-orm/node-postgres';
import { estados, municipios} from './db/schema'

export const db = drizzle("postgresql+psycopg2://postgres:123456@localhost:5432/");

