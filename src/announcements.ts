import updatesData from "../updates.json";

/**
 * Tracks which announcements (updates.json, the source of the What's new page and the RSS feed) are new
 * since the user's previous session, for the dot on the header's Announcements button.
 *
 * A session is one browser tab session (sessionStorage). Its baseline is the list of updates that existed
 * when the previous session started, so reloads keep the dot until the user opens What's new. A first
 * visit has no previous session and shows no dot.
 */

const LAST_SESSION_KEY = "labs.announcements.lastSessionIds";
const BASELINE_KEY = "labs.announcements.baselineIds";
const OPENED_KEY = "labs.announcements.opened";

const updateIds: string[] = updatesData.updates.map((update) => update.id);

function readIds(storage: Storage, key: string): string[] | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : null;
}

function sessionBaseline(): Set<string> {
  let baseline = readIds(sessionStorage, BASELINE_KEY);
  if (!baseline) {
    baseline = readIds(localStorage, LAST_SESSION_KEY) ?? updateIds;
    sessionStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(updateIds));
  }
  return new Set(baseline);
}

/** How many announcements were added since the previous session and haven't been opened this session. */
export function newAnnouncementCount(): number {
  try {
    const baseline = sessionBaseline();
    if (sessionStorage.getItem(OPENED_KEY)) return 0;
    return updateIds.filter((id) => !baseline.has(id)).length;
  } catch {
    // Storage can be blocked or hold unreadable values; show no dot rather than one that never clears.
    return 0;
  }
}

export function markAnnouncementsOpened(): void {
  try {
    sessionStorage.setItem(OPENED_KEY, "1");
  } catch {
    // Without storage the dot clears for this page view only.
  }
}
