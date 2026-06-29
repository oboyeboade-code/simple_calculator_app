// storage.js — local-storage backed history queue
const KEY = "calc.history";

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
};
const write = (items) => localStorage.setItem(KEY, JSON.stringify(items));

export const historyStore = {
  all() { return read(); },

  // Append a new local calc; `synced` flips to true after cloud confirms.
  add(expression, result, synced = false) {
    const items = read();
    items.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      expression,
      result,
      createdAt: Date.now(),
      synced,
    });
    write(items);
  },

  // Replace entire local cache with cloud-authoritative list (after sync).
  replaceAll(items) {
    const normalized = (items || []).map((it, i) => ({
      id: `cloud-${i}-${Math.random().toString(36).slice(2, 7)}`,
      expression: it.expression,
      result: it.result,
      createdAt: it.createdAt || Date.now(),
      synced: true,
    }));
    write(normalized);
  },

  // Append cloud list onto existing local cache (used after enabling sync).
  appendCloud(items) {
    const existing = read();
    const cloud = (items || []).map((it, i) => ({
      id: `cloud-${Date.now()}-${i}`,
      expression: it.expression,
      result: it.result,
      createdAt: it.createdAt || Date.now(),
      synced: true,
    }));
    // Mark everything currently pending as synced too (we just pushed it).
    const merged = [...cloud, ...existing.map((it) => ({ ...it, synced: true }))];
    write(merged);
  },

  pending() { return read().filter((it) => !it.synced); },

  markAllSynced() {
    write(read().map((it) => ({ ...it, synced: true })));
  },

  clear() { write([]); },
};