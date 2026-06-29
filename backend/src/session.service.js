import { db } from './db.js';
import { sessions } from './schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export const SessionService = {
  // Generate a cryptographically secure token and save it for 7 days
  async createSession(username) {
    const sessionId = randomBytes(32).toString('hex');
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + sevenDaysInMs;

    await db.insert(sessions).values({
      id: sessionId,
      username,
      expiresAt
    });

    return sessionId;
  },

  // Check if a session is real and still active
  async validateSession(sessionId) {
    if (!sessionId) return null;

    const record = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expiresAt, Date.now())
        )
      )
      .get();

    return record ? record.username : null;
  },

  // Explicitly kill a session (Logout)
  async deleteSession(sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
};