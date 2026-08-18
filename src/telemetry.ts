/**
 * Lightweight telemetry module for Copilot Analytics Labs.
 *
 * Tracks page views and click events to localStorage and logs them to the
 * browser console.  No external dependencies — works fully offline on
 * GitHub Pages.
 *
 * Storage key: "cal_telemetry"
 * Data shape:  { pageViews: number, firstVisit: string, lastVisit: string, events: EventRecord[] }
 */

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, string>;
  timestamp: string;
}

interface TelemetryStore {
  pageViews: number;
  firstVisit: string;
  lastVisit: string;
  events: TelemetryEvent[];
}

const STORAGE_KEY = "cal_telemetry";
const MAX_EVENTS = 500; // keep last 500 events to avoid unbounded growth

function readStore(): TelemetryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TelemetryStore;
  } catch {
    /* ignore parse errors */
  }
  return { pageViews: 0, firstVisit: "", lastVisit: "", events: [] };
}

function writeStore(store: TelemetryStore): void {
  try {
    // Trim events to MAX_EVENTS
    if (store.events.length > MAX_EVENTS) {
      store.events = store.events.slice(-MAX_EVENTS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage full — silently skip */
  }
}

/* ─── Event names (mirrors NovaClient CopilotAnalyticsLabsEventNames) ─── */
// This list is kept in sync with the NovaClient registry, so names stay here
// even when nothing in this app emits them yet.
export const TelemetryEvents = {
  PageView: "CopilotAnalyticsLabs.PageView",
  ExploreTemplatesClick: "CopilotAnalyticsLabs.ExploreTemplatesClick",
  ResourcesLibraryClick: "CopilotAnalyticsLabs.ResourcesLibraryClick",
  TemplateCardClick: "CopilotAnalyticsLabs.TemplateCardClick",
  ResourceCardClick: "CopilotAnalyticsLabs.ResourceCardClick",
  NavLinkClick: "CopilotAnalyticsLabs.NavLinkClick",
  ContactUsOpen: "CopilotAnalyticsLabs.ContactUsOpen",
  VivaInsightsClick: "CopilotAnalyticsLabs.VivaInsightsClick",
  // Funnel events
  TabClick: "CopilotAnalyticsLabs.TabClick",
  SectionView: "CopilotAnalyticsLabs.SectionView",
  HeroExploreClick: "CopilotAnalyticsLabs.HeroExploreClick",
  TemplateViewClick: "CopilotAnalyticsLabs.TemplateViewClick",
  TemplateDemoClick: "CopilotAnalyticsLabs.TemplateDemoClick",
  CodeViewClick: "CopilotAnalyticsLabs.CodeViewClick",
  ResearchViewClick: "CopilotAnalyticsLabs.ResearchViewClick",
} as const;

/* ─── Public API ─── */

/** Log a page view. Call once on mount. */
export function logPageView(): void {
  const now = new Date().toISOString();
  const store = readStore();
  store.pageViews += 1;
  if (!store.firstVisit) store.firstVisit = now;
  store.lastVisit = now;
  store.events.push({
    name: TelemetryEvents.PageView,
    timestamp: now,
  });
  writeStore(store);

  // Send page view event to Microsoft Clarity
  if (typeof window !== "undefined" && (window as any).clarity) {
    (window as any).clarity("event", TelemetryEvents.PageView);
  }

  console.log(
    `%c[Telemetry] PageView #${store.pageViews}`,
    "color:#6264A7;font-weight:bold"
  );
}

/** Log a click event with optional properties. */
export function logClick(
  eventName: string,
  properties?: Record<string, string>
): void {
  const now = new Date().toISOString();
  const store = readStore();
  store.events.push({ name: eventName, properties, timestamp: now });
  writeStore(store);

  // Send custom event to Microsoft Clarity for server-side tracking
  if (typeof window !== "undefined" && (window as any).clarity) {
    (window as any).clarity("event", eventName);
    if (properties) {
      (window as any).clarity("set", eventName, JSON.stringify(properties));
    }
  }

  console.log(
    `%c[Telemetry] ${eventName}`,
    "color:#6264A7;font-weight:bold",
    properties ?? ""
  );
}

/** Get the full telemetry summary (for debugging / export). */
export function getTelemetrySummary(): {
  pageViews: number;
  firstVisit: string;
  lastVisit: string;
  totalEvents: number;
  clicksByEvent: Record<string, number>;
} {
  const store = readStore();
  const clicksByEvent: Record<string, number> = {};
  for (const evt of store.events) {
    clicksByEvent[evt.name] = (clicksByEvent[evt.name] ?? 0) + 1;
  }
  return {
    pageViews: store.pageViews,
    firstVisit: store.firstVisit,
    lastVisit: store.lastVisit,
    totalEvents: store.events.length,
    clicksByEvent,
  };
}

// Expose helper on window for easy console debugging:
// In browser console, run: __calTelemetry() to see summary
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__calTelemetry =
    getTelemetrySummary;
}
