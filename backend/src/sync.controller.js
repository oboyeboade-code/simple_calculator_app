import { SyncService } from "./sync.service.js";
import { SessionService } from "./session.service.js";

export const SyncController = {
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