import { db } from './db.js';
import { users, history } from './schema.js';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcrypt-ts';
import { SessionService } from './session.service.js';

export const SyncService = {
  // Orchestrates the entire onboarding/login workflow in one place
  async enableSyncWorkflow(username, syncKey, localHistoryArray) {
    const existingUser = await db.select().from(users).where(eq(users.username, username)).get();
    let authorized = false;

    if (existingUser) {
      authorized = await compare(syncKey, existingUser.syncKeyHash);
    } else {
      const saltRounds = 10;
      const hashedPassword = await hash(syncKey, saltRounds);
      await db.insert(users).values({ username, syncKeyHash: hashedPassword });
      authorized = true;
    }

    if (!authorized) return null;

    // Bulk merge local data if provided
    if (localHistoryArray && localHistoryArray.length > 0) {
      const inserts = localHistoryArray.map(item => ({
        username,
        expression: item.expression,
        result: item.result,
        createdAt: Date.now()
      }));
      await db.insert(history).values(inserts);
    }

    // Delegate session creation to the session service down in the layer
    const sessionId = await SessionService.createSession(username);
    
    // Fetch final unified list
    const combinedHistory = await this.getUserHistory(username);

    return { sessionId, history: combinedHistory };
  },

  async addCalculation(username, expression, result) {
    await db.insert(history).values({
      username,
      expression,
      result,
      createdAt: Date.now()
    });
    return { expression, result };
  },

  async getUserHistory(username) {
    return await db
      .select({ expression: history.expression, result: history.result })
      .from(history)
      .where(eq(history.username, username))
      .all();
  },

  async clearUserHistory(username) {
    await db.delete(history).where(eq(history.username, username));
  }
};