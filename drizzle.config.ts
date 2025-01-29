import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
      url: "postgresql://postgres:123456@localhost:5432/",
    },
});