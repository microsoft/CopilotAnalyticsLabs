import { useEffect, useMemo, useRef, useState } from "react";
import { makeStyles, mergeClasses, shorthands } from "@fluentui/react-components";
import {
  ArrowRight16Regular,
  Book20Filled,
  BookOpen20Filled,
  BookTemplate20Filled,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Code20Filled,
  DataBarVerticalAscending24Regular,
  DataTrending24Regular,
  DocumentBulletList24Regular,
  DismissRegular,
  Eye16Regular,
  Info20Regular,
  Microscope20Filled,
  MountainLocationTop20Filled,
  Open16Regular,
  PersonFeedback20Regular,
  Sparkle24Regular,
  Star16Filled,
  WrenchScrewdriver20Filled,
} from "@fluentui/react-icons";
import heroBg from "./assets/bg-group.svg";
import { research, resources, templates, templateImpactFilters, codeHomeTechFilters } from "./data";
import type { TemplateImpactFilter, CodeHomeTechFilter } from "./data";
import { logClick, logPageView, TelemetryEvents } from "./telemetry";
import { VoteBar } from "./VoteBar";

const VIVA_INSIGHTS_URL = "https://analysis.insights.cloud.microsoft/";
const WHATS_COMING_URL = "https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=Microsoft%20Viva";
const FEEDBACK_URL = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UNTg1QzM4UUs1SzNFM08yUFhVTlJDSDlWUC4u";
const TERMS_URL = "https://www.microsoft.com/en-us/legal/terms-of-use";
const PRIVACY_URL = "https://privacy.microsoft.com/en-us/privacystatement";


const sectionTabs = [
  { id: "whats-new", label: "What's new" },
  { id: "templates", label: "Templates" },
  { id: "sample-code", label: "Sample Code" },
  { id: "research", label: "Research & Playbooks" },
  { id: "product-roadmap", label: "Roadmap" },
] as const;

// "New" window (in days) per content type. Items added within this many days
// of today are considered "new" and surface in the "What's new" section.
const NEW_WINDOW_DAYS: Record<FeaturedKind, number> = {
  Template: 30,
  Code: 30,
  Research: 15,
  Playbook: 15,
};

// Always show this item first in the "What's new" carousel (by sourceId).
const FEATURED_PINNED_FIRST = "cowork-value-estimator";

type FeaturedKind = "Template" | "Code" | "Research" | "Playbook";

const featuredToneByKind: Record<FeaturedKind, "green" | "teal" | "purple"> = {
  Template: "green",
  Code: "purple",
  Research: "teal",
  Playbook: "purple",
};

// Figma chip styling per kind: colored icon + matching pill + display label.
const featuredChipByKind: Record<
  FeaturedKind,
  { Icon: typeof BookTemplate20Filled; label: string; bg: string; fg: string; iconColor: string }
> = {
  Template: { Icon: BookTemplate20Filled, label: "Template", bg: "#F1FAF1", fg: "#0E700E", iconColor: "#0E700E" },
  Code: { Icon: Code20Filled, label: "Sample code", bg: "rgba(198, 177, 222, 0.2)", fg: "#5C2E91", iconColor: "#5C2E91" },
  Research: { Icon: Microscope20Filled, label: "Research", bg: "#FDF3F4", fg: "#C50F1F", iconColor: "#B10E1C" },
  Playbook: { Icon: Book20Filled, label: "Playbook", bg: "#F0F0F0", fg: "#242424", iconColor: "#424242" },
};

// Filter-pill labels + ordering for the "What's new" filter group.
const featuredKindOrder: FeaturedKind[] = ["Template", "Code", "Research", "Playbook"];
const featuredPillLabel: Record<FeaturedKind, string> = {
  Template: "Templates",
  Code: "Sample code",
  Research: "Research",
  Playbook: "Playbooks",
};

interface FeaturedItem {
  id: string;
  sourceId: string;
  kind: FeaturedKind;
  tone: "green" | "teal" | "purple";
  title: string;
  description: string;
  url: string;
  addedOn?: string;
}

// Whole days elapsed since an ISO date, or null when unknown/invalid.
function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

// An item is "new" when it was added within its kind's window.
function isNewForKind(iso: string | undefined, kind: FeaturedKind): boolean {
  const d = daysSince(iso);
  return d !== null && d <= NEW_WINDOW_DAYS[kind];
}

// Turns an ISO date into a friendly relative string (e.g. "2 days ago").
function formatRelativeDate(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffDays = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  const months = Math.floor(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// New items grouped by type, newest first — only those within each kind's
// window. The pinned item (if new) is always placed first.
function buildFeaturedItems(): FeaturedItem[] {
  const byDateDesc = (a: { addedOn?: string }, b: { addedOn?: string }) =>
    (b.addedOn ?? "").localeCompare(a.addedOn ?? "");

  const groups: { kind: FeaturedKind; items: { id: string; title: string; description: string; url: string; addedOn?: string }[] }[] = [
    { kind: "Template", items: templates },
    { kind: "Code", items: resources },
    { kind: "Research", items: research.filter((item) => item.kind === "Research") },
    { kind: "Playbook", items: research.filter((item) => item.kind === "Playbook") },
  ];

  const items = groups
    .flatMap(({ kind, items }) =>
      [...items]
        .filter((item) => isNewForKind(item.addedOn, kind))
        .sort(byDateDesc)
        .map<FeaturedItem>((item) => ({
          id: `${kind}-${item.id}`,
          sourceId: item.id,
          kind,
          tone: featuredToneByKind[kind],
          title: item.title,
          description: item.description,
          url: item.url,
          addedOn: item.addedOn,
        })),
    )
    .sort(byDateDesc);

  const pinnedIdx = items.findIndex((item) => item.sourceId === FEATURED_PINNED_FIRST);
  if (pinnedIdx > 0) {
    const [pinned] = items.splice(pinnedIdx, 1);
    items.unshift(pinned);
  }

  return items;
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  details?: string[];
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "agent-analytics",
    title: "Agent Analytics",
    description:
      "Comprehensive analytics for AI agents — dashboards, metrics, lifecycle management, and augmented capacity insights.",
    icon: DataTrending24Regular,
    details: [
      "Agent 365 Dashboard",
      "Agent metrics in advanced reporting",
      "Lifecycle, sharing & promotion",
      "Augmented capacity & AI teammates",
    ],
  },
  {
    id: "value-and-roi",
    title: "Value and ROI",
    description:
      "Quantify and communicate the business value and return on investment of AI across your organization.",
    icon: DataBarVerticalAscending24Regular,
    details: [
      "Copilot credits & consumption metrics",
      "Task & intent analytics",
      "Inferred satisfaction & impact",
      "Deeper Cowork & Work IQ measurement",
    ],
  },
  {
    id: "insights-agent",
    title: "Insights Agent",
    description:
      "AI-powered agent that surfaces proactive insights and recommendations from your analytics data.",
    icon: Sparkle24Regular,
    details: [
      "Insights Agent — General Availability",
      "Intelligent summaries",
      "Build-your-own custom dashboards",
    ],
  },
  {
    id: "trust-access-foundation",
    title: "Trust, Access and Foundation",
    description:
      "Foundational capabilities for security, governance, access control, and trust across the analytics platform.",
    icon: DocumentBulletList24Regular,
    details: [
      "Identified user-level export",
      "Programmatic export enhancements",
      "Flexible time ranges, tenant metric customization",
    ],
  },
];

const heroValues = [
  {
    label: "Build",
    Icon: WrenchScrewdriver20Filled,
    heading: "Build with ready-to-use assets",
    caption: "Templates, code, and prompts to plug into your own data.",
  },
  {
    label: "Learn",
    Icon: BookOpen20Filled,
    heading: "Learn from proven deployments",
    caption: "Playbooks, research, and demos from real customer rollouts.",
  },
  {
    label: "Explore",
    Icon: MountainLocationTop20Filled,
    heading: "See what's new and next",
    caption: "A preview of latest drops and upcoming capabilities.",
  },
];

const templateOrder = [
  "aio-dashboard",
  "cowork-value-estimator",
  "github-copilot-impact-org",
  "ai-business-value",
  "m365-copilot-personal",
  "superuser-impact",
];

const templateMeta: Record<
  string,
  {
    featured?: boolean;
    badges?: { text: string; tone: "green" | "rose" }[];
    stats?: { value: string; label: string }[];
  }
> = {
  "aio-dashboard": {
    featured: true,
    badges: [{ text: "Featured", tone: "green" }],
    stats: [
      { value: "—", label: "Stars" },
      { value: "—", label: "Watching" },
    ],
  },
  "cowork-value-estimator": {
    badges: [{ text: "Featured", tone: "green" }],
  },
  "m365-copilot-personal": {},
};

const resourceMeta: Record<
  string,
  {
    featured?: boolean;
    badges?: { text: string; tone: "green" | "blue" }[];
    accent: string;
    color: string;
  }
> = {
  "viva-insights-essentials": {
    featured: true,
    badges: [
      { text: "Featured", tone: "green" },
      { text: "Starter kit", tone: "blue" },
    ],
    accent: "linear-gradient(135deg, #FFF2D8 0%, #EAE6FF 100%)",
    color: "#7A4CE3",
  },
  "advanced-analytics": {
    accent: "linear-gradient(135deg, #F2EAFF 0%, #FFF3DA 100%)",
    color: "#7A4CE3",
  },
  "copilot-analytics": {
    accent: "linear-gradient(135deg, #FFF1F7 0%, #EAF8FF 100%)",
    color: "#E35BA3",
  },
  "frontier-analytics": {
    accent: "linear-gradient(135deg, #EAF5FF 0%, #FFF0D6 100%)",
    color: "#3F6CE9",
  },
  "network-analysis": {
    accent: "linear-gradient(135deg, #FFF7DF 0%, #E8F5FF 100%)",
    color: "#2976A8",
  },
  "portable-audit-exporter": {
    accent: "linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 100%)",
    color: "#2E7D32",
  },
};

const researchOrder = [
  "agent-assisted-hours",
  "new-agent-assisted-hours",
  "cowork-value-methodology",
  "causal-impact-copilot-word",
  "work-trend-index-2026",
  "new-future-of-work",
  "copilot-advanced-analytics",
  "when-ai-met-the-meeting",
];

const researchTags: Record<string, { text: string; tone: string }[]> = {
  "agent-assisted-hours": [
    { text: "Business value", tone: "blue" },
    { text: "Org wide", tone: "purple" },
  ],
  "new-agent-assisted-hours": [
    { text: "Business value", tone: "blue" },
    { text: "Org wide", tone: "purple" },
  ],
  "cowork-value-methodology": [
    { text: "Impact", tone: "blue" },
    { text: "Org wide", tone: "purple" },
  ],
  "causal-impact-copilot-word": [
    { text: "Research", tone: "teal" },
    { text: "Industry wide", tone: "amber" },
  ],
  "work-trend-index-2026": [
    { text: "Research", tone: "teal" },
    { text: "Industry wide", tone: "amber" },
  ],
  "new-future-of-work": [
    { text: "Research", tone: "teal" },
    { text: "Industry wide", tone: "amber" },
  ],
  "copilot-advanced-analytics": [
    { text: "Impact", tone: "blue" },
    { text: "Advanced", tone: "slate" },
  ],
  "when-ai-met-the-meeting": [
    { text: "Research", tone: "teal" },
    { text: "Org wide", tone: "purple" },
  ],
};

const researchPanels = [
  {
    kind: "Research" as const,
    title: "Research",
    body:
      "Adoption playbooks, methodology guides, and research from real enterprise rollouts, so you don't start from scratch.",
    linkLabel: "View all research reports",
  },
  {
    kind: "Playbook" as const,
    title: "Playbooks",
    body:
      "Proven approaches and tactical guides drawn from real enterprise Copilot deployments.",
    linkLabel: "View all playbooks",
  },
];


const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    color: "#242424",
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
  },
  disclaimerBar: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    minHeight: "48px",
    ...shorthands.padding("4px", "36px"),
    backgroundColor: "#F5F5F5",
    ...shorthands.borderTop("1px", "solid", "#D1D1D1"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("8px", "16px"),
    },
  },
  disclaimerIcon: {
    flexShrink: 0,
    color: "#616161",
    fontSize: "20px",
  },
  disclaimerTextWrap: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "4px",
    flexGrow: 1,
    flexWrap: "wrap",
  },
  disclaimerText: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    color: "#000000",
  },
  disclaimerLink: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 400,
    color: "#335CCC",
    textDecorationLine: "underline",
    whiteSpace: "nowrap",
    ':hover': {
      color: "#2A4CB0",
    },
  },
  disclaimerDismiss: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "24px",
    height: "24px",
    ...shorthands.padding("2px"),
    ...shorthands.border("none"),
    ...shorthands.borderRadius("4px"),
    backgroundColor: "transparent",
    color: "#424242",
    cursor: "pointer",
    ':hover': {
      backgroundColor: "#EBEBEB",
    },
  },
  nav: {
    position: "sticky",
    top: "0",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "48px",
    backgroundColor: "#ffffff",
    ...shorthands.padding("0", "56px"),
    boxShadow: "0 1px 0 rgba(0, 0, 0, 0.08)",
    '@media (max-width: 1200px)': {
      ...shorthands.padding("0", "80px"),
    },
    '@media (max-width: 600px)': {
      height: "auto",
      flexDirection: "column",
      alignItems: "stretch",
      ...shorthands.padding("8px", "16px"),
      gap: "4px",
    },
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minHeight: "48px",
    color: "#424242",
    ...shorthands.padding("0", "8px", "1px"),
  },
  separator: {
    width: "1px",
    height: "16px",
    backgroundColor: "#C8C8C8",
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    color: "#424242",
    whiteSpace: "nowrap",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minHeight: "48px",
    ...shorthands.padding("0", "40px"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("0"),
      justifyContent: "flex-start",
      overflowX: "auto",
      gap: "16px",
      minHeight: "36px",
    },
  },
  navLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#242424",
    fontSize: "14px",
    lineHeight: "20px",
    textDecorationLine: "none",
    whiteSpace: "nowrap",
    ':hover': {
      color: "#0E1726",
    },
  },
  navIconOnly: {
    width: "28px",
    height: "28px",
    justifyContent: "center",
    ...shorthands.borderRadius("999px"),
    ':hover': {
      backgroundColor: "#F5F5F5",
    },
  },
  hero: {
    position: "relative",
    minHeight: "520px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    '@media (max-width: 600px)': {
      minHeight: "auto",
    },
  },
  heroRibbon: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    backgroundImage: `url("${heroBg}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    '@media (max-width: 600px)': {
      opacity: 0.7,
    },
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "928px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
    ...shorthands.padding("64px", "0", "56px"),
    '@media (max-width: 1200px)': {
      maxWidth: "100%",
      ...shorthands.padding("64px", "80px", "56px"),
    },
    '@media (max-width: 600px)': {
      ...shorthands.padding("40px", "16px", "36px"),
      gap: "24px",
    },
  },
  heroHeader: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
  },
  heroTitle: {
    margin: 0,
    maxWidth: "760px",
    fontSize: "40px",
    lineHeight: "56px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    color: "#0E1726",
    whiteSpace: "nowrap",
    '@media (max-width: 600px)': {
      fontSize: "26px",
      lineHeight: "34px",
      whiteSpace: "normal",
    },
  },
  heroSubtitle: {
    margin: 0,
    maxWidth: "760px",
    fontSize: "16px",
    lineHeight: "22px",
    color: "#424242",
    '@media (max-width: 600px)': {
      fontSize: "14px",
      lineHeight: "20px",
      whiteSpace: "normal",
    },
  },
  valuesShell: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    ...shorthands.borderRadius("24px"),
    backgroundColor: "rgba(210, 225, 255, 0.5)",
    ...shorthands.padding("16px"),
    boxSizing: "border-box",
    '@media (max-width: 600px)': {
      ...shorthands.borderRadius("16px"),
      ...shorthands.padding("10px"),
    },
  },
  valuesPanel: {
    width: "100%",
    maxWidth: "896px",
    minHeight: "256px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    backgroundColor: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("40px", "24px"),
    boxSizing: "border-box",
    overflow: "hidden",
    '@media (max-width: 600px)': {
      minHeight: "0",
      ...shorthands.padding("24px", "16px"),
      gap: "16px",
    },
  },
  valuesGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "24px",
    '@media (max-width: 900px)': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
      gap: "20px",
    },
  },
  valueCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
  },
  valuePill: {
    display: "inline-flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    ...shorthands.padding("8px", "16px"),
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("24px"),
    boxShadow: "0px 1px 2px rgba(0,0,0,0.08), 0px 0px 2px rgba(0,0,0,0.10)",
  },
  valuePillIcon: {
    fontSize: "20px",
    color: "#1764E7",
    flexShrink: 0,
  },
  valuePillLabel: {
    fontSize: "16px",
    lineHeight: "22px",
    fontWeight: 600,
    color: "#242424",
  },
  valueTitle: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    color: "#000000",
    whiteSpace: "normal",
  },
  valueDescription: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "16px",
    color: "#616161",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    '@media (max-width: 600px)': {
      WebkitLineClamp: "4",
      fontSize: "13px",
      lineHeight: "18px",
    },
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    minHeight: "32px",
    backgroundColor: "#335CCC",
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    textDecorationLine: "none",
    ...shorthands.padding("6px", "12px"),
    ...shorthands.borderRadius("4px"),
    ...shorthands.border("none"),
    ':hover': {
      backgroundColor: "#294DAE",
    },
    '@media (max-width: 600px)': {
      minHeight: "44px",
      ...shorthands.padding("10px", "16px"),
    },
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "32px",
    backgroundColor: "#ffffff",
    color: "#242424",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    textDecorationLine: "none",
    ...shorthands.padding("5px", "12px"),
    ...shorthands.borderRadius("4px"),
    ...shorthands.border("1px", "solid", "#D1D1D1"),
    ':hover': {
      backgroundColor: "#F7F7F7",
    },
    '@media (max-width: 600px)': {
      minHeight: "44px",
      ...shorthands.padding("10px", "16px"),
    },
  },
  tabsShell: {
    position: "sticky",
    top: "48px",
    zIndex: 90,
    backgroundColor: "#ffffff",
    backgroundImage:
      "linear-gradient(96.15deg, rgba(118, 79, 245, 0.1) 12.38%, rgba(63, 108, 233, 0.1) 39.4%, rgba(32, 187, 198, 0.1) 96.13%)",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.14), 0px 0px 2px rgba(0,0,0,0.12)",
    '@media (max-width: 600px)': {
      top: "96px",
    },
  },
  tabsRail: {
    display: "none",
  },
  tabsList: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    maxWidth: "928px",
    marginLeft: "auto",
    marginRight: "auto",
    ...shorthands.padding("4px", "0", "0"),
    '@media (max-width: 1200px)': {
      ...shorthands.padding("4px", "80px", "0"),
      maxWidth: "100%",
    },
    '@media (max-width: 600px)': {
      ...shorthands.padding("4px", "16px", "0"),
      gap: "8px",
      overflowX: "auto",
    },
  },
  tabButton: {
    position: "relative",
    height: "44px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    color: "#424242",
    fontSize: "14px",
    lineHeight: "20px",
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
    ...shorthands.padding("12px", "10px"),
    ...shorthands.borderStyle("none"),
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  tabButtonActive: {
    color: "#242424",
    fontWeight: 600,
    ':after': {
      content: '""',
      position: "absolute",
      left: "12px",
      right: "12px",
      bottom: "0",
      height: "3px",
      ...shorthands.borderRadius("9999px"),
      backgroundColor: "#335CCC",
    },
  },
  section: {
    ...shorthands.padding("64px", "256px"),
    scrollMarginTop: "96px",
    '@media (max-width: 1200px)': {
      ...shorthands.padding("64px", "80px"),
    },
    '@media (max-width: 600px)': {
      ...shorthands.padding("36px", "16px"),
      scrollMarginTop: "144px",
    },
  },
  sectionTemplateBg: {
    background:
      "linear-gradient(113deg, rgba(240,231,255,0.7) 0%, rgba(255,255,255,1) 40%, rgba(228,243,255,0.9) 100%)",
  },
  sectionCodeBg: {
    background:
      "linear-gradient(113deg, rgba(248,230,255,0.7) 0%, rgba(255,255,255,1) 48%, rgba(255,245,214,0.85) 100%)",
  },
  sectionResearchBg: {
    background:
      "linear-gradient(96.15deg, rgba(118,79,245,0.04) 12.38%, rgba(63,108,233,0.04) 39.4%, rgba(32,187,198,0.04) 96.13%)",
  },
  sectionContent: {
    width: "100%",
    maxWidth: "928px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "48px",
    '@media (max-width: 600px)': {
      gap: "32px",
    },
  },
  sectionTitleArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  eyebrow: {
    width: "fit-content",
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    backgroundImage: "linear-gradient(96.15deg, #764FF5 12.38%, #3F6CE9 39.4%, #20BBC6 96.13%)",
    color: "transparent",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  eyebrowWarm: {
    backgroundImage: "linear-gradient(96.15deg, #E76633 -1.08%, #9D68E3 14.88%, #20BBC6 96.13%)",
  },
  sectionHeadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    '@media (max-width: 600px)': {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  sectionHeading: {
    margin: 0,
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: 600,
    color: "#0E1726",
    letterSpacing: "-0.02em",
    '@media (max-width: 600px)': {
      fontSize: "28px",
      lineHeight: "34px",
    },
  },
  sectionDescription: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#242424",
    maxWidth: "760px",
    '@media (max-width: 600px)': {
      fontSize: "14px",
      lineHeight: "20px",
    },
  },
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "24px",
    '@media (max-width: 900px)': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
    },
  },
  templateCard: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("24px"),
    boxSizing: "border-box",
    '@media (max-width: 600px)': {
      minHeight: "auto",
      ...shorthands.padding("16px"),
      gap: "16px",
    },
  },
  templateCardFeatured: {
    gridColumn: "span 2",
    flexDirection: "row",
    alignItems: "stretch",
    '@media (max-width: 900px)': {
      gridColumn: "span 2",
    },
    '@media (max-width: 600px)': {
      gridColumn: "span 1",
      flexDirection: "column",
    },
  },
  templateCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
    minWidth: 0,
  },
  templateCardImage: {
    width: "100%",
    height: "92px",
    objectFit: "cover",
    display: "block",
    backgroundColor: "#F5F5F5",
    ...shorthands.borderRadius("12px"),
  },
  templateCardImageFeatured: {
    width: "42%",
    height: "auto",
    minHeight: "268px",
    alignSelf: "stretch",
    '@media (max-width: 600px)': {
      width: "100%",
      minHeight: "180px",
    },
  },
  templateBody: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "16px",
    flex: 1,
  },
  statsDivider: {
    width: "100%",
    height: "0.5px",
    backgroundColor: "#E0E0E0",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  badgeRowFeatured: {
    gap: "16px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    ...shorthands.padding("6px", "12px"),
    ...shorthands.borderRadius("9999px"),
  },
  badgeGreen: {
    color: "#0E700E",
    backgroundColor: "#F1FAF1",
  },
  badgeRose: {
    color: "#B33A55",
    backgroundColor: "#FDEBF1",
  },
  badgeBlue: {
    color: "#0F6CBD",
    backgroundColor: "#EBF3FC",
  },
  templateTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
  },
  templateDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "18px",
    color: "#616161",
  },
  statsRow: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  statBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  statValue: {
    fontSize: "20px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#0E1726",
  },
  statLabel: {
    fontSize: "12px",
    lineHeight: "16px",
    color: "#616161",
  },
  codeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gridTemplateRows: "1fr 1fr 1fr",
    gap: "20px",
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "auto",
    },
  },
  codeCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("24px"),
    boxSizing: "border-box",
    '@media (max-width: 600px)': {
      flexDirection: "column",
      alignItems: "flex-start",
      ...shorthands.padding("16px"),
      gap: "12px",
    },
  },
  codeCardFeatured: {
    gridRow: "span 2",
    flexDirection: "column",
    alignItems: "flex-start",
    ...shorthands.padding("24px"),
    gap: "16px",
    '@media (max-width: 600px)': {
      height: "auto",
    },
  },
  codeArt: {
    flexShrink: 0,
    width: "128px",
    height: "128px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.borderRadius("14px"),
    '@media (max-width: 600px)': {
      width: "80px",
      height: "80px",
    },
  },
  codeArtFeatured: {
    width: "128px",
    height: "128px",
    '@media (max-width: 600px)': {
      width: "96px",
      height: "96px",
    },
  },
  codeCardBody: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "12px",
    flex: 1,
    alignSelf: "stretch",
  },
  codeCardBodyFeatured: {
    gap: "16px",
  },
  codeTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
  },
  codeDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "18px",
    color: "#616161",
  },
  researchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gridAutoRows: "1fr",
    gap: "16px",
    '@media (max-width: 900px)': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
    },
  },
  researchCard: {
    minHeight: "146px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("20px", "16px", "16px", "20px"),
    textDecorationLine: "none",
    '@media (max-width: 600px)': {
      minHeight: "auto",
      ...shorthands.padding("16px"),
      gap: "12px",
    },
  },
  researchTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
  },
  researchDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "18px",
    color: "#424242",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "20px",
    fontSize: "11px",
    lineHeight: "14px",
    fontWeight: 500,
    ...shorthands.padding("3px", "8px"),
    ...shorthands.borderRadius("999px"),
  },
  tagGreen: {
    color: "#2D6C2E",
    backgroundColor: "#EAF6E8",
  },
  tagPurple: {
    color: "#7A49BB",
    backgroundColor: "#F4EAFD",
  },
  tagRose: {
    color: "#b4465e",
    backgroundColor: "#FDECEF",
  },
  tagTeal: {
    color: "#1F6B73",
    backgroundColor: "#E8F8FA",
  },
  tagAmber: {
    color: "#8F5A18",
    backgroundColor: "#FFF2DE",
  },
  tagBlue: {
    color: "#2A5AC8",
    backgroundColor: "#EAF2FF",
  },
  tagOrange: {
    color: "#A84B0F",
    backgroundColor: "#FFF0E2",
  },
  tagSlate: {
    color: "#5E6A7B",
    backgroundColor: "#EFF2F6",
  },
  sectionRoadmapBg: {
    background:
      "linear-gradient(113deg, rgba(228,243,255,0.7) 0%, rgba(255,255,255,1) 40%, rgba(240,231,255,0.9) 100%)",
  },
  roadmapGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gridAutoRows: "1fr",
    gap: "16px",
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
    },
  },
  roadmapCard: {
    minHeight: "146px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("20px", "16px", "16px", "20px"),
    textDecorationLine: "none",
    cursor: "pointer",
    transitionProperty: "box-shadow, transform",
    transitionDuration: "0.2s",
    ':hover': {
      boxShadow: "0 0 2px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.10)",
      transform: "translateY(-2px)",
    },
    '@media (max-width: 600px)': {
      minHeight: "auto",
      ...shorthands.padding("16px"),
      gap: "12px",
    },
  },
  roadmapCardIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("10px"),
    backgroundColor: "#F0EBFF",
    color: "#5E4BD8",
  },
  roadmapTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
  },
  roadmapDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "18px",
    color: "#424242",
  },
  roadmapLinks: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  roadmapLink: {
    color: "#335CCC",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 500,
    textDecorationLine: "none",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  roadmapDetailOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  roadmapDetailPanel: {
    backgroundColor: "#ffffff",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("32px"),
    maxWidth: "480px",
    width: "90%",
    boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
    position: "relative",
  },
  roadmapDetailClose: {
    position: "absolute",
    top: "16px",
    right: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    ...shorthands.borderRadius("8px"),
    backgroundColor: "transparent",
    ...shorthands.border("none"),
    cursor: "pointer",
    color: "#424242",
    ':hover': {
      backgroundColor: "#F5F5F5",
    },
  },
  roadmapDetailTitle: {
    margin: 0,
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    color: "#000000",
    marginBottom: "16px",
  },
  roadmapDetailList: {
    margin: 0,
    ...shorthands.padding("0", "0", "0", "20px"),
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  roadmapDetailListItem: {
    fontSize: "14px",
    lineHeight: "20px",
    color: "#424242",
  },
  eyebrowFeatured: {
    backgroundImage: "linear-gradient(96.15deg, #E76633 -1.08%, #9D68E3 14.88%, #20BBC6 96.13%)",
  },
  roadmapTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    ...shorthands.borderBottom("1px", "solid", "#E0E0E0"),
  },
  roadmapTab: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    color: "#424242",
    fontSize: "14px",
    lineHeight: "20px",
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
    cursor: "pointer",
    ...shorthands.padding("10px", "14px"),
    ...shorthands.border("none"),
    ...shorthands.borderBottom("2px", "solid", "transparent"),
    marginBottom: "-1px",
    ':hover': {
      color: "#0E1726",
    },
  },
  roadmapTabActive: {
    color: "#0E1726",
    fontWeight: 600,
    ...shorthands.borderBottom("2px", "solid", "#335CCC"),
  },
  roadmapTabDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#424242",
    maxWidth: "760px",
  },
  roadmapDetailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    '@media (max-width: 900px)': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
    },
  },
  roadmapDetailCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("20px"),
    boxSizing: "border-box",
  },
  sectionWhatsNewBg: {
    // Figma "bg": mauve (#F4E3FF) radial glow on the left, yellow/peach (#FFF3D4 @ 0.8) on the right.
    background:
      "radial-gradient(62% 95% at 80% 42%, rgba(255,243,212,0.8) 0%, rgba(255,243,212,0) 58%), " +
      "radial-gradient(58% 90% at 18% 48%, rgba(244,227,255,0.95) 0%, rgba(244,227,255,0) 58%), " +
      "#FFFFFF",
  },
  featuredRow: {
    display: "flex",
    gap: "20px",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollPaddingInline: "2px",
    ...shorthands.padding("16px", "24px", "20px", "2px"),
    scrollbarWidth: "none",
    '::-webkit-scrollbar': {
      display: "none",
    },
  },
  featuredCard: {
    flex: "0 0 336px",
    scrollSnapAlign: "start",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.14), 0px 0px 2px rgba(0,0,0,0.12)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("24px"),
    boxSizing: "border-box",
    '@media (max-width: 600px)': {
      flex: "0 0 82%",
    },
  },
  featuredChips: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "4px",
  },
  featuredTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    height: "24px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    ...shorthands.padding("4px", "8px"),
    ...shorthands.borderRadius("100px"),
    boxSizing: "border-box",
  },
  featuredOpen: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    flexShrink: 0,
    color: "#335CCC",
    textDecorationLine: "none",
    cursor: "pointer",
    ':hover': {
      color: "#2A4CB0",
    },
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px",
  },
  filterPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: "32px",
    fontSize: "14px",
    lineHeight: "20px",
    color: "#242424",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    ...shorthands.padding("4px", "12px"),
    ...shorthands.border("1px", "solid", "#D1D1D1"),
    ...shorthands.borderRadius("100px"),
    ':hover': {
      backgroundColor: "#F5F5F5",
    },
  },
  filterPillActive: {
    color: "#FFFFFF",
    backgroundColor: "#335CCC",
    ...shorthands.borderColor("#335CCC"),
    ':hover': {
      backgroundColor: "#2A4CB0",
    },
  },
  filterPillDot: {
    width: "4px",
    height: "4px",
    flexShrink: 0,
    backgroundColor: "#335CCC",
    ...shorthands.borderRadius("50%"),
  },
  filterPillDotActive: {
    backgroundColor: "#FFFFFF",
  },
  filterPillCount: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    color: "#335CCC",
  },
  filterPillCountActive: {
    color: "#FFFFFF",
  },
  chipIconCircle: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    flexShrink: 0,
    ...shorthands.borderRadius("18px"),
  },
  chipPill: {
    display: "inline-flex",
    alignItems: "center",
    height: "24px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    ...shorthands.padding("4px", "8px"),
    ...shorthands.borderRadius("100px"),
    boxSizing: "border-box",
  },
  featuredTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
  },
  featuredDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#242424",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1,
  },
  featuredFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "4px",
  },
  featuredDate: {
    fontSize: "14px",
    lineHeight: "20px",
    color: "#707070",
  },
  featuredArrow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    color: "#ffffff",
    backgroundColor: "#335CCC",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.14), 0px 0px 2px rgba(0,0,0,0.12)",
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("none"),
    textDecorationLine: "none",
    cursor: "pointer",
    ':hover': {
      backgroundColor: "#2A4CB0",
    },
  },
  featuredNav: {
    display: "flex",
    gap: "8px",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "24px",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    color: "#242424",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    ...shorthands.padding("4px", "12px"),
    ...shorthands.borderRadius("100px"),
    ...shorthands.border("1px", "solid", "#D1D1D1"),
    ':hover': {
      backgroundColor: "#F5F5F5",
    },
  },
  chipActive: {
    color: "#ffffff",
    backgroundColor: "#335CCC",
    ...shorthands.border("1px", "solid", "#335CCC"),
    ':hover': {
      backgroundColor: "#294DAE",
    },
  },
  viewAllLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#335CCC",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    textDecorationLine: "none",
    whiteSpace: "nowrap",
    ':hover .viewAllArrow': {
      backgroundColor: "#2A4CB0",
    },
  },
  viewAllArrow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "23px",
    height: "23px",
    color: "#ffffff",
    backgroundColor: "#335CCC",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.14), 0px 0px 2px rgba(0,0,0,0.12)",
    ...shorthands.borderRadius("18px"),
    flexShrink: 0,
  },
  emptyState: {
    ...shorthands.padding("40px", "0"),
    textAlign: "center",
    fontSize: "14px",
    lineHeight: "20px",
    color: "#616161",
  },
  researchTwoPane: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    maxWidth: "928px",
    marginLeft: "auto",
    marginRight: "auto",
    '@media (max-width: 900px)': {
      flexDirection: "column",
    },
  },
  researchLeftPane: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    width: "420px",
    flexShrink: 0,
    ...shorthands.padding("8px", "0"),
    '@media (max-width: 900px)': {
      width: "100%",
    },
  },
  researchHeadingBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  researchEyebrowGradient: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    background: "linear-gradient(96.16deg, #E76633 -1.08%, #9D68E3 14.88%, #20BBC6 96.17%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  researchMainHeading: {
    margin: 0,
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: 600,
    color: "#0E1726",
  },
  researchAccordions: {
    display: "flex",
    flexDirection: "column",
  },
  researchAccordion: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.borderTop("1px", "solid", "#E0E0E0"),
    ':last-child': {
      ...shorthands.borderBottom("1px", "solid", "#E0E0E0"),
    },
  },
  researchAccordionHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shorthands.padding("20px", "16px"),
    ...shorthands.border("none"),
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    ':hover': {
      backgroundColor: "rgba(0,0,0,0.02)",
    },
  },
  researchAccordionTitle: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#242424",
  },
  researchAccordionBody: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    ...shorthands.padding("0", "16px", "20px", "16px"),
  },
  researchAccordionCopyRow: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
  },
  researchAccordionAccent: {
    width: "3px",
    flexShrink: 0,
    alignSelf: "stretch",
    backgroundColor: "#335CCC",
    ...shorthands.borderRadius("2px"),
  },
  researchAccordionBodyText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#424242",
  },
  researchAccordionLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    alignSelf: "flex-start",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    color: "#335CCC",
    textDecorationLine: "none",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  researchRightPane: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    ...shorthands.padding("8px", "48px"),
    ...shorthands.borderRadius("12px"),
    boxShadow: "0 0 2px rgba(0,0,0,0.10), 0 6px 20px rgba(0,0,0,0.05)",
    '@media (max-width: 900px)': {
      ...shorthands.padding("8px", "24px"),
    },
  },
  researchItem: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
    ...shorthands.padding("24px", "0"),
    ...shorthands.borderBottom("1px", "solid", "#E0E0E0"),
    ':last-child': {
      ...shorthands.borderBottom("none"),
    },
  },
  researchItemHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  researchItemChips: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "8px",
  },
  researchItemChip: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "10px",
    lineHeight: "14px",
    fontWeight: 400,
    ...shorthands.padding("4px", "8px"),
    ...shorthands.borderRadius("100px"),
  },
  researchItemCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  researchItemTitleRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    textDecorationLine: "none",
    ':hover .research-item-title': {
      textDecorationLine: "underline",
    },
  },
  researchItemTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
  },
  researchItemArrow: {
    display: "inline-flex",
    color: "#335CCC",
    flexShrink: 0,
  },
  researchItemSubtext: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "16px",
    color: "#616161",
  },
  featuredNavButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    color: "#3F6CE9",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.14), 0px 0px 2px rgba(0,0,0,0.12)",
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("none"),
    ':hover': {
      backgroundColor: "#F5F5F5",
    },
  },
  footer: {
    backgroundColor: "#ffffff",
    boxShadow: "0 -1px 0 rgba(0,0,0,0.08)",
    ...shorthands.padding("24px", "256px"),
    '@media (max-width: 1200px)': {
      ...shorthands.padding("24px", "80px"),
    },
    '@media (max-width: 600px)': {
      ...shorthands.padding("24px", "16px"),
    },
  },
  footerContent: {
    maxWidth: "928px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#424242",
    flexWrap: "wrap",
  },
  footerDisclaimer: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "16px",
    color: "#616161",
    maxWidth: "1120px",
  },
  footerLinks: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#335CCC",
    fontSize: "12px",
    lineHeight: "16px",
    textDecorationLine: "none",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
});

export function MicrosoftLogoWordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="0" y="0" width="7.3" height="7.3" fill="#F25022" />
        <rect x="8.7" y="0" width="7.3" height="7.3" fill="#7FBA00" />
        <rect x="0" y="8.7" width="7.3" height="7.3" fill="#00A4EF" />
        <rect x="8.7" y="8.7" width="7.3" height="7.3" fill="#FFB900" />
      </svg>
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#424242", whiteSpace: "nowrap" }}>
        Microsoft
      </span>
    </div>
  );
}

function App() {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<(typeof sectionTabs)[number]["id"]>("whats-new");
  const [ghStats, setGhStats] = useState<{ stars: string; forks: string; watchers: string }>({ stars: "—", forks: "—", watchers: "—" });
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    logPageView();
  }, []);

  useEffect(() => {
    fetch("https://api.github.com/repos/microsoft/AI-in-One-Dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count != null) {
          setGhStats({
            stars: String(data.stargazers_count),
            forks: String(data.forks_count),
            watchers: String(data.subscribers_count),
          });
        }
      })
      .catch(() => {});
  }, []);

  const orderedTemplates = useMemo(() => {
    const map = new Map(templates.map((item) => [item.id, item]));
    return templateOrder.map((id) => map.get(id)).filter(Boolean) as typeof templates;
  }, []);

  const [templateFilter, setTemplateFilter] = useState<TemplateImpactFilter>("Featured");
  const visibleTemplates = useMemo(
    () =>
      templateFilter === "Featured"
        ? orderedTemplates
        : orderedTemplates.filter((item) => item.impact.includes(templateFilter)),
    [orderedTemplates, templateFilter],
  );

  const [codeFilter, setCodeFilter] = useState<CodeHomeTechFilter>("Featured");
  const visibleResources = useMemo(
    () =>
      codeFilter === "Featured"
        ? resources
        : resources.filter((item) => item.tech.includes(codeFilter)),
    [codeFilter],
  );

  const orderedResearch = useMemo(() => {
    const map = new Map(research.map((item) => [item.id, item]));
    return researchOrder.map((id) => map.get(id)).filter(Boolean) as typeof research;
  }, []);

  const [openResearchPanel, setOpenResearchPanel] = useState<"Research" | "Playbook" | null>("Research");
  const visibleResearchItems = useMemo(
    () => orderedResearch.filter((item) => item.kind === openResearchPanel).slice(0, 3),
    [orderedResearch, openResearchPanel],
  );

  const featuredItems = useMemo(() => buildFeaturedItems(), []);

  const featuredCounts = useMemo(() => {
    const counts = new Map<FeaturedKind, number>();
    featuredItems.forEach((item) => counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1));
    return counts;
  }, [featuredItems]);

  // Only kinds that actually have new content get a filter pill (dynamic pills).
  const featuredKinds = useMemo(
    () => featuredKindOrder.filter((kind) => (featuredCounts.get(kind) ?? 0) > 0),
    [featuredCounts],
  );

  const [featuredFilter, setFeaturedFilter] = useState<FeaturedKind | "All">("All");

  const visibleFeatured = useMemo(
    () => (featuredFilter === "All" ? featuredItems : featuredItems.filter((item) => item.kind === featuredFilter)),
    [featuredItems, featuredFilter],
  );

  const featuredRowRef = useRef<HTMLDivElement>(null);
  const scrollFeatured = (dir: number) => {
    featuredRowRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const [activeRoadmapTab, setActiveRoadmapTab] = useState<string>(roadmapItems[0].id);
  const activeRoadmap = roadmapItems.find((item) => item.id === activeRoadmapTab) ?? roadmapItems[0];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            // Prefer the element closer to the top of the viewport
            return a.boundingClientRect.top - b.boundingClientRect.top;
          })[0];

        if (visible?.target.id) {
          setActiveTab(visible.target.id as (typeof sectionTabs)[number]["id"]);
          logClick(TelemetryEvents.SectionView, { section: visible.target.id });
        }
      },
      {
        rootMargin: "-10% 0px -60% 0px",
        threshold: [0.05, 0.2, 0.35, 0.5],
      },
    );

    sectionTabs.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const smoothScrollTo = (target: HTMLElement) => {
    const start = window.scrollY;
    const headerOffset = 96;
    const end = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const distance = end - start;
    const duration = Math.min(800, Math.max(400, Math.abs(distance) * 0.5));
    let startTime: number | null = null;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const scrollToSection = (sectionId: (typeof sectionTabs)[number]["id"]) => {
    setActiveTab(sectionId);
    logClick(TelemetryEvents.TabClick, { tab: sectionId });
    const el = document.getElementById(sectionId);
    if (el) smoothScrollTo(el);
  };

  return (
    <div className={styles.page}>
      {showDisclaimer && (
        <div className={styles.disclaimerBar} role="status">
          <Info20Regular className={styles.disclaimerIcon} aria-hidden="true" />
          <div className={styles.disclaimerTextWrap}>
            <span className={styles.disclaimerText}>
              The materials on this page are provided as-is, without warranty of any kind, including merchantability or fitness for a particular purpose. Microsoft will not provide any support for these materials.
            </span>
            <a
              className={styles.disclaimerLink}
              href={TERMS_URL}
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
          </div>
          <button
            type="button"
            className={styles.disclaimerDismiss}
            onClick={() => setShowDisclaimer(false)}
            aria-label="Dismiss disclaimer"
          >
            <DismissRegular fontSize={16} />
          </button>
        </div>
      )}
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <MicrosoftLogoWordmark />
          <div className={styles.separator} />
          <span className={styles.brandTitle}>Copilot Analytics Labs</span>
        </div>

        <div className={styles.navLinks}>
          <a className={styles.navLink} href={VIVA_INSIGHTS_URL} target="_blank" rel="noreferrer">
            <img src={`${import.meta.env.BASE_URL}images/VI.svg`} alt="" width="20" height="20" aria-hidden="true" />
            <span>Insights</span>
          </a>
          <a className={styles.navLink} href={FEEDBACK_URL} target="_blank" rel="noreferrer">
            <span>Feedback</span>
          </a>
          <button
            className={mergeClasses(styles.navLink, styles.navIconOnly)}
            onClick={() => setShowContactDialog(true)}
            aria-label="Contact us"
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <PersonFeedback20Regular fontSize={16} />
          </button>
        </div>
      </nav>

      {showContactDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-dialog-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowContactDialog(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowContactDialog(false);
            if (e.key === "Tab") {
              const dialog = e.currentTarget.querySelector<HTMLElement>('[data-dialog-panel]');
              if (!dialog) return;
              const focusable = dialog.querySelectorAll<HTMLElement>(
                'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
              );
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (e.shiftKey) {
                if (document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                }
              } else {
                if (document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }
          }}
          ref={(el) => {
            if (el) {
              const close = el.querySelector<HTMLElement>('[data-dialog-close]');
              if (close) close.focus();
            }
          }}
        >
          <div
            data-dialog-panel=""
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "420px",
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              textAlign: "center",
              fontFamily: '"Segoe UI", system-ui, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PersonFeedback20Regular style={{ fontSize: "32px", color: "#6264A7", marginBottom: "12px" }} />
            <h3 id="contact-dialog-title" style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 600, color: "#242424" }}>
              Contact Us
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "14px", lineHeight: "20px", color: "#616161" }}>
              For further questions and doubts — Please drop a mail to{" "}
              <a href="mailto:CopilotAnalyticsLabs@microsoft.com" style={{ color: "#0078D4", textDecoration: "none" }}>
                CopilotAnalyticsLabs@microsoft.com
              </a>
            </p>
            <button
              data-dialog-close=""
              onClick={() => setShowContactDialog(false)}
              style={{
                padding: "8px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "#0078D4",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className={styles.hero}>
        <div className={styles.heroRibbon} />
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <h1 className={styles.heroTitle}>Frontier analytics for Copilot and agents</h1>
            <p className={styles.heroSubtitle}>
              Guided templates, sample code, and playbooks grounded in real customer deployments to help you design and deploy analytics beyond what's available in Insights today.
            </p>
          </div>

          <div className={styles.valuesShell}>
            <div className={styles.valuesPanel}>
              <div className={styles.valuesGrid}>
                {heroValues.map(({ label, heading, caption, Icon }) => (
                  <div key={label} className={styles.valueCard}>
                    <div className={styles.valuePill}>
                      <Icon className={styles.valuePillIcon} aria-hidden="true" />
                      <span className={styles.valuePillLabel}>{label}</span>
                    </div>
                    <h2 className={styles.valueTitle}>{heading}</h2>
                    <p className={styles.valueDescription}>{caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.tabsShell}>
        <div className={styles.tabsList} role="tablist" aria-label="Sections">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={mergeClasses(styles.tabButton, activeTab === tab.id && styles.tabButtonActive)}
              onClick={() => scrollToSection(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.tabsRail} />
      </div>

      <section id="whats-new" className={mergeClasses(styles.section, styles.sectionWhatsNewBg)}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTitleArea}>
            <p className={mergeClasses(styles.eyebrow, styles.eyebrowFeatured)}>Featured</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>See what's new and popular in labs</h2>
            </div>
            <p className={styles.sectionDescription}>
              Newly added resources containing templates, sample codes, research, playbooks and demos.
            </p>
          </div>

          {featuredKinds.length > 0 && (
            <div className={styles.filterGroup} role="tablist" aria-label="Filter new content">
              <button
                type="button"
                className={mergeClasses(styles.filterPill, featuredFilter === "All" && styles.filterPillActive)}
                aria-pressed={featuredFilter === "All"}
                onClick={() => setFeaturedFilter("All")}
              >
                All
              </button>
              {featuredKinds.map((kind) => {
                const active = featuredFilter === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    className={mergeClasses(styles.filterPill, active && styles.filterPillActive)}
                    aria-pressed={active}
                    onClick={() => setFeaturedFilter(kind)}
                  >
                    {featuredPillLabel[kind]}
                    <span className={mergeClasses(styles.filterPillDot, active && styles.filterPillDotActive)} />
                    <span className={mergeClasses(styles.filterPillCount, active && styles.filterPillCountActive)}>
                      {featuredCounts.get(kind)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {visibleFeatured.length > 0 ? (
            <>
              <div className={styles.featuredRow} ref={featuredRowRef}>
                {visibleFeatured.map((item) => {
                  const chip = featuredChipByKind[item.kind];
                  return (
                    <article key={item.id} className={styles.featuredCard}>
                      <div className={styles.featuredChips}>
                        <span className={styles.featuredTag} style={{ backgroundColor: chip.bg, color: chip.fg }}>
                          <chip.Icon fontSize={16} style={{ color: chip.iconColor }} />
                          {chip.label}
                        </span>
                        <a
                          className={styles.featuredOpen}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${item.title}`}
                          onClick={() => logClick(TelemetryEvents.TemplateViewClick, { template: item.sourceId })}
                        >
                          <Open16Regular fontSize={16} />
                        </a>
                      </div>
                      <h3 className={styles.featuredTitle}>{item.title}</h3>
                      <p className={styles.featuredDescription}>{item.description}</p>
                      <div className={styles.featuredFooter}>
                        <span className={styles.featuredDate}>{formatRelativeDate(item.addedOn)}</span>
                        <VoteBar cardId={item.sourceId} />
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className={styles.featuredNav}>
                <button type="button" className={styles.featuredNavButton} aria-label="Scroll previous" onClick={() => scrollFeatured(-1)}>
                  <ChevronLeft20Regular fontSize={18} />
                </button>
                <button type="button" className={styles.featuredNavButton} aria-label="Scroll next" onClick={() => scrollFeatured(1)}>
                  <ChevronRight20Regular fontSize={18} />
                </button>
              </div>
            </>
          ) : (
            <p className={styles.featuredDate}>No new resources right now — check back soon.</p>
          )}
        </div>
      </section>

      <section id="templates" className={mergeClasses(styles.section, styles.sectionTemplateBg)}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTitleArea}>
            <p className={styles.eyebrow}>Template library</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>Pick a template, build a dashboard</h2>
              <a
                className={styles.viewAllLink}
                href={`${import.meta.env.BASE_URL}#/templates`}
                onClick={() => logClick(TelemetryEvents.TabClick, { tab: "view-all-templates" })}
              >
                View all templates
                <span className={`${styles.viewAllArrow} viewAllArrow`}><ArrowRight16Regular fontSize={12} /></span>
              </a>
            </div>
            <p className={styles.sectionDescription}>
              Production-ready dashboard templates for adoption, usage, impact, and business value that combine Insights data with broader organizational signals.
            </p>
          </div>

          <div className={styles.chipRow} role="tablist" aria-label="Filter templates">
            {templateImpactFilters.map((cat) => (
              <button
                key={cat}
                type="button"
                className={mergeClasses(styles.chip, templateFilter === cat && styles.chipActive)}
                aria-pressed={templateFilter === cat}
                onClick={() => setTemplateFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {visibleTemplates.length === 0 ? (
            <p className={styles.emptyState}>More templates are coming to this category soon.</p>
          ) : (
          <div className={styles.templateGrid}>
            {visibleTemplates.map((item) => {
              const meta = templateMeta[item.id] ?? {};
              const isFeatured = Boolean(meta.featured);

              return (
                <article
                  key={item.id}
                  className={mergeClasses(styles.templateCard, isFeatured && styles.templateCardFeatured)}
                >
                  {!isFeatured && item.image ? (
                    <img className={styles.templateCardImage} src={item.image} alt="" loading="lazy" decoding="async" />
                  ) : null}

                  <div className={styles.templateCardContent}>
                    {meta.badges?.length ? (
                      <div className={styles.badgeRow}>
                        {meta.badges.map((badge) => (
                          <span
                            key={badge.text}
                            className={mergeClasses(
                              styles.badge,
                              badge.tone === "green" ? styles.badgeGreen : styles.badgeRose,
                            )}
                          >
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className={styles.templateBody}>
                      <div className={styles.templateCardContent}>
                        <h3 className={styles.templateTitle}>{item.title}</h3>
                        <p className={styles.templateDescription}>{item.description}</p>
                      </div>

                      {meta.stats?.length ? (
                        <>
                          <div className={styles.statsDivider} />
                          <div className={styles.statsRow}>
                            {meta.stats.map((stat) => {
                              let value = stat.value;
                              if (item.id === "aio-dashboard") {
                                if (stat.label === "Stars") value = ghStats.stars;
                                else if (stat.label === "Watching") value = ghStats.watchers;
                              }
                              return (
                                <div key={stat.label} className={styles.statBlock}>
                                  <span className={styles.statValue}>
                                    {stat.label === "Stars" && <Star16Filled fontSize={14} style={{ color: "#EAA300", marginRight: 4 }} />}
                                    {stat.label === "Watching" && <Eye16Regular fontSize={14} style={{ marginRight: 4 }} />}
                                    {value}
                                  </span>
                                  <span className={styles.statLabel}>{stat.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : null}

                      <div>
                        <a className={styles.secondaryButton} href={item.url} target="_blank" rel="noreferrer" aria-label={`View template: ${item.title}`} onClick={() => logClick(TelemetryEvents.TemplateViewClick, { template: item.id })}>
                          View template
                        </a>
                      </div>
                      <VoteBar cardId={item.id} />
                    </div>
                  </div>

                  {isFeatured && item.image ? (
                    <img
                      className={mergeClasses(styles.templateCardImage, styles.templateCardImageFeatured)}
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </article>
              );
            })}
          </div>
          )}
        </div>
      </section>

      <section id="sample-code" className={mergeClasses(styles.section, styles.sectionCodeBg)}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTitleArea}>
            <p className={styles.eyebrow}>Sample code</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>Grab the code, make it yours</h2>
              <a className={styles.viewAllLink} href={`${import.meta.env.BASE_URL}#/codes`} onClick={() => logClick(TelemetryEvents.TabClick, { tab: "view-all-codes" })}>
                View all code samples
                <span className={`${styles.viewAllArrow} viewAllArrow`}><ArrowRight16Regular fontSize={12} /></span>
              </a>
            </div>
            <p className={styles.sectionDescription}>
              Reusable scripts, prompt libraries, and analytical methods for Python, R, and Power BI - adaptable to your organization's data.
            </p>
          </div>

          <div className={styles.chipRow} role="tablist" aria-label="Filter sample code">
            {codeHomeTechFilters.map((cat) => (
              <button
                key={cat}
                type="button"
                className={mergeClasses(styles.chip, codeFilter === cat && styles.chipActive)}
                aria-pressed={codeFilter === cat}
                onClick={() => setCodeFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {visibleResources.length === 0 ? (
            <p className={styles.emptyState}>More sample code is coming to this category soon.</p>
          ) : (
          <div className={styles.codeGrid}>
            {visibleResources.map((item) => {
              const Icon = item.icon ?? DocumentBulletList24Regular;
              const meta = resourceMeta[item.id];
              const isFeatured = Boolean(meta?.featured);

              return (
                <article key={item.id} className={mergeClasses(styles.codeCard, isFeatured && styles.codeCardFeatured)}>
                  <div
                    className={mergeClasses(styles.codeArt, isFeatured && styles.codeArtFeatured)}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <Icon />
                    )}
                  </div>

                  <div className={mergeClasses(styles.codeCardBody, isFeatured && styles.codeCardBodyFeatured)}>
                    {meta?.badges?.length ? (
                      <div className={mergeClasses(styles.badgeRow, isFeatured && styles.badgeRowFeatured)}>
                        {meta.badges.map((badge) => (
                          <span
                            key={badge.text}
                            className={mergeClasses(
                              styles.badge,
                              badge.tone === "green" ? styles.badgeGreen : styles.badgeBlue,
                            )}
                          >
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className={styles.templateCardContent}>
                      <h3 className={styles.codeTitle}>{item.title}</h3>
                      <p className={styles.codeDescription}>{item.description}</p>
                    </div>

                    <div>
                      <a className={styles.secondaryButton} href={item.url} target="_blank" rel="noreferrer" onClick={() => logClick(TelemetryEvents.CodeViewClick, { resource: item.id })}>
                        View code
                      </a>
                    </div>
                    <VoteBar cardId={item.id} />
                  </div>
                </article>
              );
            })}
          </div>
          )}
        </div>
      </section>

      <section id="research" className={mergeClasses(styles.section, styles.sectionResearchBg)}>
        <div className={styles.sectionContent}>
          <div className={styles.researchTwoPane}>
            <div className={styles.researchLeftPane}>
              <div className={styles.researchHeadingBlock}>
                <p className={styles.researchEyebrowGradient}>RESEARCH &amp; PLAYBOOKS</p>
                <h2 className={styles.researchMainHeading}>Examples from around the world</h2>
              </div>

              <div className={styles.researchAccordions}>
                {researchPanels.map((panel) => {
                  const isOpen = openResearchPanel === panel.kind;
                  return (
                    <div key={panel.kind} className={styles.researchAccordion}>
                      <button
                        type="button"
                        className={styles.researchAccordionHeader}
                        aria-expanded={isOpen}
                        onClick={() => setOpenResearchPanel(isOpen ? null : panel.kind)}
                      >
                        <span className={styles.researchAccordionTitle}>{panel.title}</span>
                      </button>
                      {isOpen ? (
                        <div className={styles.researchAccordionBody}>
                          <div className={styles.researchAccordionCopyRow}>
                            <span className={styles.researchAccordionAccent} aria-hidden="true" />
                            <p className={styles.researchAccordionBodyText}>{panel.body}</p>
                          </div>
                          <a
                            className={styles.researchAccordionLink}
                            href={`${import.meta.env.BASE_URL}#/research`}
                            onClick={() => logClick(TelemetryEvents.TabClick, { tab: `research-${panel.kind.toLowerCase()}-view-all` })}
                          >
                            {panel.linkLabel}
                            <ArrowRight16Regular fontSize={14} />
                          </a>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.researchRightPane}>
              {visibleResearchItems.map((item) => (
                <article key={item.id} className={styles.researchItem}>
                  <div className={styles.researchItemHeader}>
                    <div className={styles.researchItemChips}>
                      {(researchTags[item.id] ?? []).map((tag) => (
                        <span
                          key={tag.text}
                          className={mergeClasses(
                            styles.researchItemChip,
                            tag.tone === "green" && styles.tagGreen,
                            tag.tone === "purple" && styles.tagPurple,
                            tag.tone === "rose" && styles.tagRose,
                            tag.tone === "teal" && styles.tagTeal,
                            tag.tone === "amber" && styles.tagAmber,
                            tag.tone === "blue" && styles.tagBlue,
                            tag.tone === "orange" && styles.tagOrange,
                            tag.tone === "slate" && styles.tagSlate,
                          )}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>
                    <VoteBar cardId={item.id} variant="inline" />
                  </div>
                  <div className={styles.researchItemCopy}>
                    <a
                      className={styles.researchItemTitleRow}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => logClick(TelemetryEvents.ResearchViewClick, { research: item.id })}
                    >
                      <h3 className={mergeClasses(styles.researchItemTitle, "research-item-title")}>{item.title}</h3>
                      <span className={styles.researchItemArrow}>
                        <ArrowRight16Regular fontSize={16} />
                      </span>
                    </a>
                    <p className={styles.researchItemSubtext}>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product-roadmap" className={mergeClasses(styles.section, styles.sectionRoadmapBg)}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTitleArea}>
            <p className={styles.eyebrow}>Product roadmap</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>What's next for Copilot Analytics</h2>
            </div>
            <p className={styles.sectionDescription}>
              Upcoming capabilities and investments shaping the future of AI-powered analytics.
            </p>
          </div>

          <div className={styles.roadmapTabs} role="tablist" aria-label="Roadmap categories">
            {roadmapItems.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeRoadmapTab === item.id}
                className={mergeClasses(styles.roadmapTab, activeRoadmapTab === item.id && styles.roadmapTabActive)}
                onClick={() => { setActiveRoadmapTab(item.id); logClick(TelemetryEvents.TabClick, { tab: `roadmap-${item.id}` }); }}
              >
                <item.icon />
                {item.title}
              </button>
            ))}
          </div>

          <p className={styles.roadmapTabDescription}>{activeRoadmap.description}</p>

          <div className={styles.roadmapDetailGrid}>
            {(activeRoadmap.details ?? []).map((detail) => (
              <article key={detail} className={styles.roadmapDetailCard}>
                <div className={styles.roadmapCardIcon}>
                  <activeRoadmap.icon />
                </div>
                <h3 className={styles.roadmapTitle}>{detail}</h3>
              </article>
            ))}
          </div>

          <div className={styles.roadmapLinks}>
            <a className={styles.roadmapLink} href={WHATS_COMING_URL} target="_blank" rel="noreferrer">
              For detailed roadmap — click here ↗
            </a>
            <a className={styles.roadmapLink} href={FEEDBACK_URL} target="_blank" rel="noreferrer">
              Product roadmap feedback ↗
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <MicrosoftLogoWordmark />
            <div className={styles.separator} />
            <span className={styles.brandTitle}>Copilot Analytics Labs</span>
          </div>

          <p className={styles.footerDisclaimer}>
            Disclaimer: The materials on this page are provided as-is, without warranty of any kind, including merchantability or fitness for a particular purpose. Microsoft will not provide any support for these materials.
          </p>

          <div className={styles.footerLinks}>
            <a className={styles.footerLink} href={TERMS_URL} target="_blank" rel="noreferrer">
              Terms and Conditions
            </a>
            <a className={styles.footerLink} href={PRIVACY_URL} target="_blank" rel="noreferrer">
              Privacy Statement
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
