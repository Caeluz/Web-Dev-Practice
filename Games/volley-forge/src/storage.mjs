import { CONTENT_UNLOCKS, STARTER_UNLOCKS } from "./data.mjs";

export const SAVE_KEY = "volley-forge-meta-v1";
export const SAVE_VERSION = 1;

export function createDefaultMeta() {
  return {
    version: SAVE_VERSION,
    forgeShards: 0,
    unlockedIds: [...STARTER_UNLOCKS],
    bestScore: 0,
    bossVictories: 0,
    settings: { muted: false },
  };
}

export function sanitizeMeta(value) {
  const fallback = createDefaultMeta();
  if (!value || typeof value !== "object" || value.version !== SAVE_VERSION) return fallback;

  const knownIds = new Set([
    ...STARTER_UNLOCKS,
    ...CONTENT_UNLOCKS.map((unlock) => unlock.id),
  ]);
  const unlockedIds = Array.isArray(value.unlockedIds)
    ? value.unlockedIds.filter((id) => knownIds.has(id))
    : [];

  return {
    version: SAVE_VERSION,
    forgeShards: Math.max(0, Math.trunc(Number(value.forgeShards) || 0)),
    unlockedIds: [...new Set([...STARTER_UNLOCKS, ...unlockedIds])],
    bestScore: Math.max(0, Math.trunc(Number(value.bestScore) || 0)),
    bossVictories: Math.max(0, Math.trunc(Number(value.bossVictories) || 0)),
    settings: { muted: Boolean(value.settings?.muted) },
  };
}

export function loadMeta(storage = globalThis.localStorage) {
  try {
    const serialized = storage?.getItem(SAVE_KEY);
    return serialized ? sanitizeMeta(JSON.parse(serialized)) : createDefaultMeta();
  } catch {
    return createDefaultMeta();
  }
}

export function saveMeta(meta, storage = globalThis.localStorage) {
  const clean = sanitizeMeta(meta);
  try {
    storage?.setItem(SAVE_KEY, JSON.stringify(clean));
  } catch {
    return false;
  }
  return true;
}

export function purchaseUnlock(meta, unlockId) {
  const unlock = CONTENT_UNLOCKS.find((entry) => entry.id === unlockId);
  if (!unlock) return { purchased: false, reason: "unknown" };
  if (meta.unlockedIds.includes(unlockId)) return { purchased: false, reason: "owned" };
  if (meta.forgeShards < unlock.price) return { purchased: false, reason: "insufficient" };
  meta.forgeShards -= unlock.price;
  meta.unlockedIds.push(unlockId);
  return { purchased: true };
}
