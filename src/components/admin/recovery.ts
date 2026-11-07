/**
 * A copy of unsaved work kept on this device, so it survives an expired session,
 * a lost connection, or closing the tab mid-edit.
 */
const KEY = 'portfolio-admin-recovery';

export type Recovery = { content: unknown; savedAt: number };

export function writeRecovery(content: unknown) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ content, savedAt: Date.now() }));
  } catch {
    // Storage is full or blocked. The work is still in memory and on the server.
  }
}

export function readRecovery(): Recovery | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Recovery>;
    return parsed.content && typeof parsed.savedAt === 'number'
      ? { content: parsed.content, savedAt: parsed.savedAt }
      : null;
  } catch {
    return null;
  }
}

export function clearRecovery() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear when storage is blocked.
  }
}

export function hasRecovery() {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
