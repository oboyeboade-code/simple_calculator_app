// api.js — talks to the `simplycalc-api` backend

const API_URL = "https://simplecalculator.up.railway.app";
const SESSION_KEY = "calc.sessionId";

let activeSessionId =
  (typeof localStorage !== "undefined" && localStorage.getItem(SESSION_KEY)) || null;

export const getSessionToken = () => activeSessionId;
export const setSessionToken = (token) => {
  activeSessionId = token;
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem(SESSION_KEY, token);
    else localStorage.removeItem(SESSION_KEY);
  }
};

async function request(endpoint, options = {}) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    if (activeSessionId) headers["x-session-id"] = activeSessionId;

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const payload = await res.json().catch(() => ({}));

    return {
      ok: res.ok,
      status: res.status,
      data: payload,
      error: !res.ok ? (payload?.error || `HTTP ${res.status}`) : undefined,
    };
  } catch (err) {
    return { ok: false, status: 0, error: "Network error — is the backend running?" };
  }
}

// Endpoint mapping matches `explore` backend (src/sync.routes.js)
export const syncApi = {
  // POST /api/enable-sync  { username, syncKey, localHistory }
  async enableSync(username, syncKey, localHistory = []) {
    const res = await request("/api/enable-sync", {
      method: "POST",
      body: JSON.stringify({ username, syncKey, localHistory }),
    });
    if (res.ok && res.data?.sessionId) setSessionToken(res.data.sessionId);
    return res;
  },

  // POST /api/logout
  async logout() {
    const res = await request("/api/logout", { method: "POST" });
    setSessionToken(null);
    return res;
  },

  // POST /api/calculation  { expression, result }
  async addCalculation(expression, result) {
    return request("/api/calculation", {
      method: "POST",
      body: JSON.stringify({ expression, result }),
    });
  },

  // GET /api/history
  async getHistory() {
    return request("/api/history", { method: "GET" });
  },

  // DELETE /api/history
  async clearHistory() {
    return request("/api/history", { method: "DELETE" });
  },

  isSignedIn() {
    return Boolean(activeSessionId);
  },
};