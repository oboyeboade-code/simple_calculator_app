import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. Users Table
export const users = sqliteTable('users', {
  username: text('username').primaryKey(),
  syncKeyHash: text('sync_key_hash').notNull()
});

// 2. Calculation History Table
export const history = sqliteTable('history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().references(() => users.username, { onDelete: 'cascade' }),
  expression: text('expression').notNull(),
  result: text('result').notNull(),
  createdAt: integer('created_at').notNull()
});

// 3. Sessions Table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), 
  username: text('username').notNull().references(() => users.username, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull()
});