import { SyncService } from "./sync.service.js";
import { SessionService } from "./session.service.js";

export const SyncController = {
  // 1. Enable Sync / Authenticate (Original)
  async enableSync(req, res) {
    const { username, syncKey, localHistory } = req.body;

    if (!username || !syncKey) {
      return res.status(400).json({
        error: "Username and syncKey are required."
      });
    }

    const result = await SyncService.enableSyncWorkflow(
      username,
      syncKey,
      localHistory || []
    );

    if (!result) {
      return res.status(401).json({
        error: "Invalid sync key for this username."
      });
    }

    return res.json(result);
  },

  // 2. NEW: Add a single calculation to history
  async addCalculation(req, res) {
    const sessionId = req.headers["x-session-id"];
    const { expression, result } = req.body;

    const username = await SessionService.validateSession(sessionId);
    if (!username) {
      return res.status(401).json({ error: "Unauthorized. Invalid session." });
    }

    if (expression === undefined || result === undefined) {
      return res.status(400).json({
        error: "Expression and result are required."
      });
    }

    const calculation = await SyncService.addCalculation(username, expression, result);
    return res.json(calculation);
  },

  // 3. NEW: Get all calculation history for the user
  async getUserHistory(req, res) {
    const sessionId = req.headers["x-session-id"];

    const username = await SessionService.validateSession(sessionId);
    if (!username) {
      return res.status(401).json({ error: "Unauthorized. Invalid session." });
    }

    const history = await SyncService.getUserHistory(username);
    return res.json({ history });
  },

  // 4. NEW: Clear all history for the user
  async clearUserHistory(req, res) {
    const sessionId = req.headers["x-session-id"];

    const username = await SessionService.validateSession(sessionId);
    if (!username) {
      return res.status(401).json({ error: "Unauthorized. Invalid session." });
    }

    await SyncService.clearUserHistory(username);
    return res.json({
      message: "History cleared successfully."
    });
  },

  // 5. Logout (Original)
  async logout(req, res) {
    const sessionId = req.headers["x-session-id"];

    if (sessionId) {
      await SessionService.deleteSession(sessionId);
    }

    return res.json({
      message: "Logged out successfully. Session revoked."
    });
  }
};