const STORAGE_KEY = "mavera-demo";
// Bump this when the shape of the state changes, so old saved data is ignored instead of breaking the app.
const STORAGE_VERSION = 1;

export function loadSavedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved.version === STORAGE_VERSION ? saved.state : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }));
  } catch {
    // Storage can be full or blocked (private windows). The demo still works in memory.
  }
}
