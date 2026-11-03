/**
 * Anonymous thumbs up / thumbs down voting for cards.
 *
 * Storage strategy:
 *  - When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are configured, votes are
 *    stored in a shared Supabase table so counts are global across all visitors.
 *    No user identity, cookies, or PII are sent; voting is fully anonymous. The
 *    anon key is public by design and writes are constrained by row-level
 *    security (only the `apply_vote` RPC can mutate counts).
 *  - Otherwise, counts fall back to localStorage so the UI still works locally.
 *
 * A per-browser record of *this* browser's vote (localStorage) prevents double
 * counting and lets the user toggle / switch their vote. It stores only the card
 * id and direction, never any identity.
 */

import { useCallback, useState, useSyncExternalStore } from "react";

export type VoteDirection = "up" | "down";

export interface VoteCounts {
  up: number;
  down: number;
}

const EMPTY_COUNTS: VoteCounts = Object.freeze({ up: 0, down: 0 });

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const LS_MY_VOTES = "cal_card_my_votes"; // { [cardId]: "up" | "down" }
const LS_LOCAL_COUNTS = "cal_card_vote_counts"; // fallback aggregate counts

/* ─── In-memory store + subscription ─── */

const counts = new Map<string, VoteCounts>();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function setCounts(cardId: string, value: VoteCounts): void {
  counts.set(cardId, value);
  emit();
}

/* ─── localStorage helpers ─── */

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

function getMyVote(cardId: string): VoteDirection | null {
  const map = readJson<Record<string, VoteDirection>>(LS_MY_VOTES, {});
  return map[cardId] ?? null;
}

function setMyVote(cardId: string, dir: VoteDirection | null): void {
  const map = readJson<Record<string, VoteDirection>>(LS_MY_VOTES, {});
  if (dir) map[cardId] = dir;
  else delete map[cardId];
  writeJson(LS_MY_VOTES, map);
}

/* ─── Backend I/O ─── */

function authHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_ANON_KEY as string,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

let loadPromise: Promise<void> | null = null;

async function loadAllCounts(): Promise<void> {
  if (isConfigured) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/card_votes?select=card_id,up,down`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const rows = (await res.json()) as { card_id: string; up: number; down: number }[];
        rows.forEach((r) => counts.set(r.card_id, { up: r.up ?? 0, down: r.down ?? 0 }));
        emit();
        return;
      }
    } catch {
      /* network error: fall through to local */
    }
  }
  const local = readJson<Record<string, VoteCounts>>(LS_LOCAL_COUNTS, {});
  Object.entries(local).forEach(([id, c]) => counts.set(id, c));
  emit();
}

function ensureLoaded(): void {
  if (!loadPromise) loadPromise = loadAllCounts();
}

async function persistDelta(cardId: string, upDelta: number, downDelta: number): Promise<VoteCounts> {
  if (isConfigured) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apply_vote`, {
        method: "POST",
        headers: { ...authHeaders(), Prefer: "return=representation" },
        body: JSON.stringify({ p_card_id: cardId, p_up: upDelta, p_down: downDelta }),
      });
      if (res.ok) {
        const data = (await res.json()) as
          | { up: number; down: number }
          | { up: number; down: number }[];
        const row = Array.isArray(data) ? data[0] : data;
        if (row) return { up: row.up ?? 0, down: row.down ?? 0 };
      }
    } catch {
      /* fall through to local */
    }
  }
  // localStorage fallback aggregate
  const local = readJson<Record<string, VoteCounts>>(LS_LOCAL_COUNTS, {});
  const current = local[cardId] ?? { up: 0, down: 0 };
  const next: VoteCounts = {
    up: Math.max(current.up + upDelta, 0),
    down: Math.max(current.down + downDelta, 0),
  };
  local[cardId] = next;
  writeJson(LS_LOCAL_COUNTS, local);
  return next;
}

/* ─── React hook ─── */

/**
 * Provides live vote counts and a `vote` action for a single card.
 * Voting is anonymous and idempotent per browser (click again to undo, or click
 * the opposite direction to switch).
 */
export function useCardVotes(cardId: string): {
  counts: VoteCounts;
  myVote: VoteDirection | null;
  vote: (dir: VoteDirection) => void;
  pending: boolean;
} {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    ensureLoaded();
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const getSnapshot = useCallback(() => counts.get(cardId) ?? EMPTY_COUNTS, [cardId]);
  const liveCounts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const [myVote, setMyVoteState] = useState<VoteDirection | null>(() => getMyVote(cardId));
  const [pending, setPending] = useState(false);

  const vote = useCallback(
    (dir: VoteDirection) => {
      const prev = getMyVote(cardId);
      let upDelta = 0;
      let downDelta = 0;
      let next: VoteDirection | null;

      if (prev === dir) {
        // toggle off
        next = null;
        if (dir === "up") upDelta = -1;
        else downDelta = -1;
      } else {
        next = dir;
        if (dir === "up") upDelta = 1;
        else downDelta = 1;
        if (prev === "up") upDelta -= 1;
        else if (prev === "down") downDelta -= 1;
      }

      // optimistic update
      const current = counts.get(cardId) ?? EMPTY_COUNTS;
      const optimistic: VoteCounts = {
        up: Math.max(current.up + upDelta, 0),
        down: Math.max(current.down + downDelta, 0),
      };
      setCounts(cardId, optimistic);
      setMyVote(cardId, next);
      setMyVoteState(next);

      setPending(true);
      void persistDelta(cardId, upDelta, downDelta)
        .then((server) => setCounts(cardId, server))
        .finally(() => setPending(false));
    },
    [cardId],
  );

  return { counts: liveCounts, myVote, vote, pending };
}
