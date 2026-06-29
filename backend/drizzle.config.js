import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/schema.js',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db',
  },
});