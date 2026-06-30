// history.js — manages the history page and Sync toggle
import { syncApi } from "./api.js";
import { historyStore } from "./storage.js";

const $ = (id) => document.getElementById(id);
const listEl = $("historyList");
const emptyEl = $("historyEmpty");
const toggleEl = $("syncToggle");
const stateEl = $("syncState");
const userEl = $("syncUser");
const formEl = $("syncForm");
const usernameEl = $("username");
const syncKeyEl = $("syncKey");
const msgEl = $("syncMsg");
const refreshBtn = $("refreshBtn");
const clearBtn = $("clearBtn");

const USER_KEY = "calc.username";

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

const setMsg = (text, kind = "") => {
  msgEl.textContent = text || "";
  msgEl.className = "sync-msg" + (kind ? ` ${kind}` : "");
};

const render = () => {
  const items = historyStore.all();
  listEl.innerHTML = "";
  if (items.length === 0) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  for (const it of items) {
    const li = document.createElement("li");
    li.className = "history-item";
    const badgeClass = it.synced ? "synced" : "pending";
    const badgeText = it.synced ? "SYNCED" : "LOCAL";
    li.innerHTML = `
      <span class="history-item__expr">${escape(it.expression)} =</span>
      <span>
        <span class="history-item__result">${escape(it.result)}</span>
        <span class="history-item__badge ${badgeClass}">${badgeText}</span>
      </span>`;
    listEl.appendChild(li);
  }
};

const reflectSyncState = () => {
  const on = syncApi.isSignedIn();
  toggleEl.checked = on;
  stateEl.textContent = on ? "ON" : "OFF";
  const u = localStorage.getItem(USER_KEY);
  userEl.textContent = on && u ? ` · ${u}` : "";
  formEl.style.display = on ? "none" : "grid";
};

// Restore saved username
usernameEl.value = localStorage.getItem(USER_KEY) || "";

const enableSync = async () => {
  const username = usernameEl.value.trim();
  const syncKey = syncKeyEl.value.trim();
  if (!username || !syncKey) {
    setMsg("Enter a username and sync key first.", "err");
    toggleEl.checked = false;
    return;
  }

  setMsg("Connecting…");
  toggleEl.disabled = true;

  // Send pending local calcs to merge on the server.
  const pending = historyStore.pending().map((it) => ({
    expression: it.expression,
    result: it.result,
  }));

  const res = await syncApi.enableSync(username, syncKey, pending);
  toggleEl.disabled = false;

  if (!res.ok) {
    setMsg(res.error || "Could not enable sync.", "err");
    toggleEl.checked = false;
    return;
  }

  localStorage.setItem(USER_KEY, username);
  // Server returned the unified history — make it the new local cache.
  historyStore.replaceAll(res.data?.history || []);
  syncKeyEl.value = "";
  reflectSyncState();
  render();
  setMsg("Sync enabled. Cloud history loaded.", "ok");
};

const disableSync = async () => {
  setMsg("Disconnecting…");
  toggleEl.disabled = true;
  await syncApi.logout();
  toggleEl.disabled = false;
  // Keep local cache, but flag all items as "LOCAL" again since cloud session is gone.
  const items = historyStore.all().map((it) => ({ ...it, synced: false }));
  localStorage.setItem("calc.history", JSON.stringify(items));
  reflectSyncState();
  render();
  setMsg("Sync turned off. History stays in this browser.", "ok");
};

toggleEl.addEventListener("change", () => {
  if (toggleEl.checked) enableSync();
  else disableSync();
});

refreshBtn.addEventListener("click", async () => {
  if (!syncApi.isSignedIn()) {
    render();
    setMsg("Showing local history (sync is off).");
    return;
  }
  setMsg("Refreshing from cloud…");
  const res = await syncApi.getHistory();
  if (!res.ok) {
    setMsg(res.error || "Refresh failed.", "err");
    return;
  }
  console.log(res.data):
  historyStore.replaceAll(res.data || []);
  render();
  setMsg("Cloud history loaded.", "ok");
});

clearBtn.addEventListener("click", async () => {
  if (!confirm("Clear all calculation history?")) return;
  if (syncApi.isSignedIn()) {
    const res = await syncApi.clearHistory();
    if (!res.ok) {
      setMsg(res.error || "Could not clear cloud history.", "err");
      return;
    }
  }
  historyStore.clear();
  render();
  setMsg("History cleared.", "ok");
});

// Initial paint + opportunistic cloud refresh if already signed in.
reflectSyncState();
render();
if (syncApi.isSignedIn()) {
  (async () => {
    const res = await syncApi.getHistory();
    if (res.ok) {
      historyStore.replaceAll(res.data || []);
      render();
    } else if (res.status === 401) {
      // Session expired
      await syncApi.logout();
      reflectSyncState();
      setMsg("Session expired — sign in again.", "err");
    }
  })();
}
