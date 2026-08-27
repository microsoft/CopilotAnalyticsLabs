import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { makeStyles, mergeClasses, shorthands, Tooltip } from "@fluentui/react-components";
import {
  ArrowRight16Regular,
  ArrowTrendingText20Filled,
  ArrowTrendingText20Regular,
  ChartMultiple20Filled,
  ChartMultiple20Regular,
  ChevronLeft20Regular,
  ChevronRight20Filled,
  ChevronRight20Regular,
  Eye16Regular,
  FlowSparkle20Regular,
  Open16Filled,
  Open16Regular,
  PersonGuest20Filled,
  PersonGuest20Regular,
  Sparkle20Filled,
  Sparkle20Regular,
  Star16Filled,
} from "@fluentui/react-icons";
import { research, resources, templates, templateImpactFilters, codeHomeTechFilters } from "./data";
import type { TemplateImpactFilter, CodeHomeTechFilter } from "./data";
import { logClick, logPageView, TelemetryEvents } from "./telemetry";
import { VoteBar } from "./VoteBar";
import { DemoVideoButton } from "./DemoVideo";


const sectionTabs = [
  { id: "whats-new", label: "What's new" },
  { id: "templates", label: "Templates" },
  { id: "sample-code", label: "Sample code" },
  { id: "research", label: "Research & Playbooks" },
  { id: "product-roadmap", label: "Roadmap" },
] as const;

// "New" window (in days) per content type. Items added within this many days
// of today are considered "new" and surface in the "What's new" section.
const NEW_WINDOW_DAYS: Record<FeaturedKind, number> = {
  Template: 22,
  Code: 30,
  Research: 15,
  Playbook: 15,
};

type FeaturedKind = "Template" | "Code" | "Research" | "Playbook";

const featuredToneByKind: Record<FeaturedKind, "green" | "teal" | "purple"> = {
  Template: "green",
  Code: "purple",
  Research: "teal",
  Playbook: "purple",
};

const featuredChipByKind: Record<FeaturedKind, { label: string; bg: string; fg: string }> = {
  Template: { label: "Template", bg: "#F1FAF1", fg: "#0E700E" },
  Code: { label: "Sample code", bg: "rgba(198, 177, 222, 0.2)", fg: "#5C2E91" },
  Research: { label: "Research", bg: "#FDF3F4", fg: "#C50F1F" },
  Playbook: { label: "Playbook", bg: "#F0F0F0", fg: "#242424" },
};

// Filter-pill labels + ordering for the "What's new" filter group.
const featuredKindOrder: FeaturedKind[] = ["Template", "Code", "Research", "Playbook"];
const featuredPillLabel: Record<FeaturedKind, string> = {
  Template: "Templates",
  Code: "Sample codes",
  Research: "Research",
  Playbook: "Playbooks",
};

// How many featured cards the row shows at once. Past this the row scrolls,
// so it is also the threshold for showing the scroll arrows.
const FEATURED_CARDS_PER_VIEW = 3;

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

async function fetchBadgeCount(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Count request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("message" in data) ||
    typeof data.message !== "string"
  ) {
    throw new Error("Count response did not include a message");
  }

  return data.message;
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

// New items grouped by type, newest first — only those within each kind's window.
function buildFeaturedItems(): FeaturedItem[] {
  const byDateDesc = (a: { addedOn?: string }, b: { addedOn?: string }) =>
    (b.addedOn ?? "").localeCompare(a.addedOn ?? "");

  const groups: { kind: FeaturedKind; items: { id: string; title: string; description: string; url: string; addedOn?: string }[] }[] = [
    { kind: "Template", items: templates },
    { kind: "Code", items: resources },
    { kind: "Research", items: research.filter((item) => item.kind === "Research") },
    { kind: "Playbook", items: research.filter((item) => item.kind === "Playbook") },
  ];

  return groups
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
}

const heroValues = [
  {
    title: "Build with ready-to-use assets",
    description: "Templates, code, and prompts\nto plug into your own data.",
  },
  {
    title: "Proven in real deployments",
    description: "Playbooks, research, and demos\nfrom real customer rollouts.",
  },
  {
    title: "See what's new and next",
    description: "A preview of latest drops\nand upcoming capabilities.",
  },
];

const templateOrder = [
  "aio-dashboard",
  "valuelens",
  "consumption-central",
  "cowork-value-estimator",
  "credit-usage-chargebacks",
];

const templateFilterLabelHome: Record<TemplateImpactFilter, string> = {
  Featured: "Featured",
  "AI Impact": "AI impact",
  "Org wide": "Org-wide",
  Individual: "Individual",
  Team: "Team",
};

const templateMeta: Record<
  string,
  {
    featured?: boolean;
    badges?: { text: string; tone: "green" | "teal" | "purple" | "orange" | "red" | "blue" }[];
    stats?: { value: string; label: string }[];
  }
> = {
  "aio-dashboard": {
    featured: true,
    badges: [
      { text: "Featured", tone: "green" },
      { text: "AI-impact", tone: "teal" },
      { text: "Org wide", tone: "purple" },
    ],
    stats: [
      { value: "—", label: "Stars" },
      { value: "—", label: "Watching" },
      { value: "<10 min", label: "Setup" },
    ],
  },
  "cowork-value-estimator": {
    badges: [
      { text: "Featured", tone: "green" },
      { text: "AI-impact", tone: "teal" },
      { text: "Individual", tone: "orange" },
    ],
  },
  valuelens: {
    badges: [
      { text: "New", tone: "blue" },
      { text: "AI-impact", tone: "teal" },
      { text: "Org wide", tone: "purple" },
    ],
  },
  "consumption-central": {
    badges: [
      { text: "New", tone: "blue" },
      { text: "Org wide", tone: "purple" },
      { text: "Team", tone: "red" },
    ],
  },
  "github-copilot-impact-org": {
    badges: [
      { text: "AI-impact", tone: "teal" },
      { text: "Org wide", tone: "purple" },
    ],
  },
  "m365-copilot-personal": {
    badges: [{ text: "Individual", tone: "orange" }],
  },
  "credit-usage-chargebacks": {
    badges: [
      { text: "Org wide", tone: "purple" },
      { text: "Team", tone: "red" },
    ],
  },
  "superuser-impact": {
    badges: [{ text: "Team", tone: "red" }],
  },
};

const templateHomeCopyOverrides: Record<string, { title?: string; description?: string }> = {
  "github-copilot-impact-org": {
    title: "GitHub Copilot Impact (Org Level)",
  },
  "m365-copilot-personal": {
    title: "M365 Copilot Personal Insights",
    description:
      "Personal adoption & engagement dashboard tracking your M365 Copilot usage journey and productivity gains.",
  },
  "superuser-impact": {
    title: "Super-user Impact Report",
    description:
      "Analyze the work and productivity impact of super-users across your org with detailed pattern analysis.",
  },
};

const codeHomeOrder = [
  "viva-insights-essentials",
  "advanced-analytics",
  "copilot-causal-toolkit",
  "portable-audit-exporter",
  "frontier-analytics",
  "copilot-analytics",
];

const maxHomeCodeCards = 6;

const resourceMeta: Record<
  string,
  {
    featured?: boolean;
    wide?: boolean;
    badges?: { text: string; tone: "green" | "purple" | "red" | "orange" | "teal" }[];
  }
> = {
  "viva-insights-essentials": {
    featured: true,
    wide: true,
    badges: [
      { text: "Featured", tone: "green" },
      { text: "Python", tone: "red" },
      { text: "R", tone: "orange" },
    ],
  },
  "advanced-analytics": {
    badges: [
      { text: "Python", tone: "red" },
      { text: "R", tone: "orange" },
    ],
  },
  "frontier-analytics": {
    badges: [
      { text: "AI-assisted", tone: "teal" },
      { text: "Power BI", tone: "purple" },
    ],
  },
  "portable-audit-exporter": {
    wide: true,
    badges: [{ text: "AI-assisted", tone: "teal" }],
  },
  "network-analysis": {
    badges: [
      { text: "Power BI", tone: "purple" },
      { text: "Python", tone: "red" },
      { text: "R", tone: "orange" },
    ],
  },
  "copilot-analytics": {
    badges: [
      { text: "Python", tone: "red" },
      { text: "R", tone: "orange" },
    ],
  },
  "copilot-causal-toolkit": {
    badges: [
      { text: "Python", tone: "red" },
      { text: "AI-assisted", tone: "teal" },
    ],
  },
};

const codeHomeCopyOverrides: Record<string, { description?: string }> = {
  "viva-insights-essentials": {
    description:
      "Get started with R & Python utility scripts — exploratory data analysis, standard visualisations, and custom KPI generation from Insights data.",
  },
  "advanced-analytics": {
    description: "Advanced analytical techniques and methods for deeper Viva Insights data.",
  },
  "network-analysis": {
    description:
      "Organizational network analysis techniques to understand collaboration patterns and connectivity.",
  },
  "frontier-analytics": {
    description: "Cutting-edge analytical approaches and frontier methods for workplace intelligence.",
  },
  "portable-audit-exporter": {
    description:
      "Export and analyze Microsoft 365 audit logs with a portable, ready-to-run toolkit for compliance and usage insights.",
  },
  "copilot-analytics": {
    description: "Sample code and examples for analyzing Microsoft Copilot usage and impact data.",
  },
};

const researchOrder = [
  "ai-transformation-invisible-work",
  "agent-assisted-hours",
  "new-agent-assisted-hours",
  "adoption-playbook",
  "getting-started-custom-analysis",
  "work-trend-index-2026",
  "cowork-value-estimator",
  "copilot-advanced-analytics",
  "new-future-of-work",
  "causal-impact-copilot-word",
  "when-ai-met-the-meeting",
];

const researchTags: Record<string, { text: string; tone: string }[]> = {
  "ai-transformation-invisible-work": [
    { text: "Research", tone: "teal" },
    { text: "Industry wide", tone: "amber" },
  ],
  "agent-assisted-hours": [
    { text: "Business value", tone: "blue" },
    { text: "Org wide", tone: "purple" },
  ],
  "new-agent-assisted-hours": [
    { text: "Business value", tone: "blue" },
    { text: "Org wide", tone: "purple" },
  ],
  "new-future-of-work": [
    { text: "Research", tone: "teal" },
    { text: "Industry wide", tone: "amber" },
  ],
  "causal-impact-copilot-word": [
    { text: "Impact", tone: "blue" },
    { text: "Benchmark", tone: "slate" },
  ],
  "when-ai-met-the-meeting": [
    { text: "Research", tone: "teal" },
    { text: "Industry wide", tone: "amber" },
  ],
  "adoption-playbook": [
    { text: "Adoption", tone: "green" },
    { text: "Org wide", tone: "purple" },
  ],
  "getting-started-custom-analysis": [
    { text: "Methodology", tone: "rose" },
    { text: "Org wide", tone: "purple" },
  ],
  "work-trend-index-2026": [
    { text: "Research", tone: "teal" },
    { text: "Industry wide", tone: "amber" },
  ],
  "cowork-value-estimator": [
    { text: "Methodology", tone: "rose" },
    { text: "Cowork", tone: "teal" },
  ],
  "copilot-advanced-analytics": [
    { text: "Impact", tone: "blue" },
    { text: "Advanced", tone: "slate" },
  ],
};

const researchPanels = [
  {
    kind: "Research" as const,
    label: "RESEARCH",
    subtitle: "Insights from orgs leading AI adoption",
    body:
      "Adoption playbooks, methodology guides, and research from real enterprise rollouts, so you don't start from scratch.",
    linkLabel: "View all research reports",
  },
  {
    kind: "Playbook" as const,
    label: "PLAYBOOKS",
    subtitle: "Strategies already in play",
    body:
      "Proven approaches and tactical guides drawn from real enterprise Copilot deployments.",
    linkLabel: "View all playbooks",
  },
];

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ fontSize?: number; className?: string; style?: React.CSSProperties }>;
  iconActive: React.ComponentType<{ fontSize?: number; className?: string; style?: React.CSSProperties }>;
  details?: string[];
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "agent-analytics",
    title: "Agent Analytics",
    description:
      "Comprehensive analytics for AI agents — dashboards, metrics, lifecycle management, and augmented capacity insights.",
    icon: ChartMultiple20Regular,
    iconActive: ChartMultiple20Filled,
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
    icon: ArrowTrendingText20Regular,
    iconActive: ArrowTrendingText20Filled,
    details: [
      "Copilot credits & consumption metrics",
      "Task & intent analytics",
      "Inferred satisfaction & impact",
      "Deeper Cowork & Work IQ measurement",
    ],
  },
  {
    id: "insights-agent",
    title: "Insights agent",
    description:
      "AI-powered agent that surfaces proactive insights and recommendations from your analytics data.",
    icon: Sparkle20Regular,
    iconActive: Sparkle20Filled,
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
    icon: PersonGuest20Regular,
    iconActive: PersonGuest20Filled,
    details: [
      "Identified user-level export",
      "Programmatic export enhancements",
      "Flexible time ranges, tenant metric customization and GM/CXO access fixes",
    ],
  },
];


const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
    backgroundColor: "#ffffff",
    color: "#242424",
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    // The artwork is a transparent PNG on `heroArt`, so this gradient is the
    // hero's only wash and shows through it: a faint blue at the top falling
    // away to white.
    backgroundColor: "#ffffff",
    backgroundImage: "linear-gradient(180deg, #EFF6FF 0%, #FDFEFF 55%, #FFFFFF 100%)",
    ...shorthands.padding("40px", "24px"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("32px", "16px"),
    },
  },
  // Mirrors the geometry of `heroContent` so the artwork lives inside the same
  // centred column as every other section of the page. Without this the art was
  // anchored to the viewport's right edge and spilled past the column, which
  // made the whole page read as right-aligned on wide screens.
  heroArtColumn: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "24px",
    right: "24px",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "1024px",
    zIndex: 0,
    pointerEvents: "none",
    '@media (max-width: 900px)': {
      display: "none",
    },
  },
  heroArt: {
    position: "absolute",
    top: 0,
    bottom: 0,
    // Flush with the column's right edge, so the illustration ends exactly where
    // the page's content ends.
    right: 0,
    // Wide enough to hold the artwork uncropped at full hero height: the PNG is
    // 546x378, so at `auto 100%` it renders ~1.44x the hero's height.
    width: "480px",
    maxWidth: "46%",
    // The PNG's field fades out on its edges, so it blends into the hero
    // gradient with no seam and needs no edge mask.
    backgroundImage: `url(${import.meta.env.BASE_URL}images/herobg1.png)`,
    backgroundRepeat: "no-repeat",
    // Scale by HEIGHT so the illustration fills the hero at its native
    // proportions rather than being shrunk to the column's spare width.
    backgroundSize: "auto 100%",
    backgroundPosition: "right center",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1024px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "24px",
    '@media (max-width: 600px)': {
      gap: "20px",
    },
  },
  heroHeader: {
    maxWidth: "740px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "12px",
    textAlign: "left",
  },
  heroTitle: {
    margin: 0,
    fontSize: "40px",
    lineHeight: "47.8px",
    fontWeight: 600,
    letterSpacing: 0,
    color: "#0E1726",
    '@media (max-width: 600px)': {
      fontSize: "30px",
      lineHeight: "38px",
    },
  },
  heroTitleAccent: {
    backgroundImage: "linear-gradient(90deg, #7C4DEE 0%, #6355E8 42%, #3D6BE5 82%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  },
  heroSubtitle: {
    margin: 0,
    maxWidth: "640px",
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#616161",
    '@media (max-width: 600px)': {
      maxWidth: "100%",
      fontSize: "14px",
      lineHeight: "20px",
    },
  },
  heroDivider: {
    width: "100%",
    maxWidth: "600px",
    height: "1px",
    backgroundColor: "#E0E0E0",
  },
  tabsShell: {
    position: "sticky",
    top: "48px",
    zIndex: 90,
    background: "linear-gradient(96.15deg, rgba(118, 79, 245, 0.1) 12.38%, rgba(63, 108, 233, 0.1) 39.4%, rgba(32, 187, 198, 0.1) 96.13%)",
    backgroundColor: "#ffffff",
    boxShadow: "0px 0px 2px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.14)",
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
    gap: "9px",
    width: "100%",
    maxWidth: "1024px",
    marginLeft: "auto",
    marginRight: "auto",
    ...shorthands.padding("4px", "0", "0"),
    '@media (max-width: 1200px)': {
      ...shorthands.padding("4px", "0", "0"),
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
    // Rest and hover share the same foreground; the selected tab is set apart
    // by the darker #242424, the bolder weight, and the brand indicator.
    color: "#424242",
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "20px",
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
    ...shorthands.padding("12px", "10px"),
    ...shorthands.borderStyle("none"),
    cursor: "pointer",
    whiteSpace: "nowrap",
    // Hover reveals a neutral indicator in the same slot the active tab uses,
    // so the bar does not shift when a tab becomes selected.
    ':hover:after': {
      content: '""',
      position: "absolute",
      left: "12px",
      right: "12px",
      bottom: "0",
      height: "3px",
      ...shorthands.borderRadius("9999px"),
      backgroundColor: "#C7C7C7",
    },
    ':active:after': {
      backgroundColor: "#B3B3B3",
    },
  },
  tabButtonActive: {
    color: "#242424",
    fontWeight: 700,
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
    // The selected tab keeps its brand indicator on hover and press.
    ':hover:after': {
      backgroundColor: "#335CCC",
    },
    ':active:after': {
      backgroundColor: "#335CCC",
    },
  },
  section: {
    ...shorthands.padding("64px", "24px"),
    scrollMarginTop: "64px",
    '@media (max-width: 1200px)': {
      ...shorthands.padding("64px", "24px"),
      scrollMarginTop: "64px",
    },
    '@media (max-width: 600px)': {
      ...shorthands.padding("36px", "16px"),
      scrollMarginTop: "36px",
    },
  },
  sectionTemplateBg: {
    // Figma: white base with Viva OverlayShape (blue→purple, 0.12) + Blue_accent (0.16) ambient blobs, heavily blurred.
    background:
      "radial-gradient(1100px 720px at 8% -6%, rgba(74,164,217,0.12) 0%, rgba(30,85,202,0.10) 34%, rgba(93,68,205,0.07) 60%, rgba(255,255,255,0) 82%), " +
      "radial-gradient(980px 640px at 98% -8%, rgba(103,149,255,0.14) 0%, rgba(19,66,176,0.08) 40%, rgba(82,117,197,0) 70%), " +
      "linear-gradient(82.58deg, rgba(74,164,217,0.05) 12%, rgba(30,85,202,0.05) 42%, rgba(93,68,205,0.04) 66%, rgba(255,255,255,0) 100%), " +
      "#FFFFFF",
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
    maxWidth: "1024px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "48px",
    '@media (max-width: 600px)': {
      gap: "32px",
    },
  },
  templateSectionContent: {
    gap: "24px",
  },
  templateSectionDescription: {
    maxWidth: "1024px",
    whiteSpace: "nowrap",
    '@media (max-width: 900px)': {
      whiteSpace: "normal",
    },
  },
  codeSectionDescription: {
    maxWidth: "1024px",
    whiteSpace: "nowrap",
    '@media (max-width: 900px)': {
      whiteSpace: "normal",
    },
  },
  featuredSectionContent: {
    gap: "24px",
  },
  codeSectionContent: {
    gap: "24px",
  },
  sectionTitleArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  eyebrow: {
    width: "fit-content",
    margin: 0,
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    letterSpacing: 0,
    textTransform: "uppercase",
    backgroundImage: "linear-gradient(137.22deg, #764FF5 14.49%, #3F6CE9 42.08%, #20BBC6 100%)",
    color: "transparent",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  eyebrowFeatured: {
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
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: 600,
    color: "#0E1726",
    letterSpacing: 0,
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
    gridTemplateColumns: "320px repeat(2, minmax(0, 1fr))",
    gridTemplateRows: "repeat(2, minmax(256px, auto))",
    gap: "20px",
    '@media (max-width: 900px)': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gridTemplateRows: "auto",
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "auto",
    },
  },
  templateCard: {
    minHeight: "256px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
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
    gridRow: "span 2",
    minHeight: "532px",
    gap: "16px",
    '@media (max-width: 900px)': {
      gridRow: "span 1",
      minHeight: "auto",
    },
    '@media (max-width: 600px)': {
      minHeight: "auto",
    },
  },
  templateCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: 0,
  },
  templateCardImage: {
    width: "100%",
    height: "235px",
    objectFit: "cover",
    display: "block",
    backgroundColor: "#F5F5F5",
    ...shorthands.borderRadius("12px"),
  },
  templateBody: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    flex: 1,
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "24px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    ...shorthands.padding("4px", "8px"),
    ...shorthands.borderRadius("100px"),
  },
  badgeGreen: {
    color: "#0E700E",
    backgroundColor: "#F1FAF1",
  },
  badgeTeal: {
    color: "#00666D",
    backgroundColor: "#E5FEFF",
  },
  badgePurple: {
    color: "#881798",
    backgroundColor: "rgba(198, 177, 222, 0.2)",
  },
  badgeOrange: {
    color: "#FF5C39",
    backgroundColor: "#FFF4D8",
  },
  badgeRed: {
    color: "#B10E1C",
    backgroundColor: "#FDF3F4",
  },
  badgeBlue: {
    color: "#0F548C",
    backgroundColor: "#EFF6FC",
  },
  templateTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  templateDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "18px",
    color: "#616161",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  templateActionsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginTop: "auto",
  },
  templateVideoRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "auto",
    marginBottom: "16px",
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
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
  },
  statLabel: {
    fontSize: "12px",
    lineHeight: "16px",
    color: "#707070",
  },
  codeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gridAutoRows: "226px",
    gap: "20px",
    '@media (max-width: 900px)': {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gridAutoRows: "auto",
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
      gridAutoRows: "auto",
    },
  },
  codeCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "16px",
    minHeight: "100%",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("20px"),
    boxSizing: "border-box",
    '@media (max-width: 600px)': {
      minHeight: "auto",
      ...shorthands.padding("16px"),
      gap: "12px",
    },
  },
  codeCardWide: {
    gridColumn: "span 2",
    flexDirection: "row",
    gap: "8px",
    padding: "20px",
    alignItems: "flex-start",
    '@media (max-width: 900px)': {
      gridColumn: "span 2",
      flexDirection: "row",
    },
    '@media (max-width: 600px)': {
      gridColumn: "span 1",
      flexDirection: "column",
      gap: "16px",
      padding: "16px",
      alignItems: "stretch",
    },
  },
  codeCardSquare: {
    gridColumn: "span 1",
  },
  codeCardWideImage: {
    width: "128px",
    height: "128px",
    objectFit: "cover",
    display: "block",
    ...shorthands.borderRadius("12px"),
    flexShrink: 0,
  },
  codeCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
    alignSelf: "stretch",
  },
  codeTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  codeDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "18px",
    color: "#616161",
  },
  codeActionsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "auto",
  },
  codeCardButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
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
  },
  codeVoteBar: {
    marginTop: "0",
    flexShrink: 0,
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
    color: "#BE4A63",
    backgroundColor: "#FDECEF",
  },
  tagTeal: {
    color: "#2A7D86",
    backgroundColor: "#E8F8FA",
  },
  tagAmber: {
    color: "#A86A1E",
    backgroundColor: "#FFF2DE",
  },
  tagBlue: {
    color: "#2F69E8",
    backgroundColor: "#EAF2FF",
  },
  tagOrange: {
    color: "#D56A16",
    backgroundColor: "#FFF0E2",
  },
  tagSlate: {
    color: "#5E6A7B",
    backgroundColor: "#EFF2F6",
  },
  sectionRoadmapBg: {
    background:
      "linear-gradient(137.22deg, rgba(118,79,245,0.04) 14.49%, rgba(63,108,233,0.04) 42.08%, rgba(32,187,198,0.04) 100%)",
  },
  roadmapTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 400,
    color: "#000000",
  },
  roadmapLinks: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    '@media (max-width: 600px)': {
      justifyContent: "flex-start",
    },
  },
  roadmapLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#335CCC",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    textDecorationLine: "none",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  heroValuesRow: {
    display: "flex",
    alignItems: "stretch",
    gap: "18px",
    '@media (max-width: 700px)': {
      flexDirection: "column",
      gap: "16px",
      alignItems: "flex-start",
    },
  },
  heroValueDivider: {
    flex: "0 0 auto",
    alignSelf: "center",
    width: "1px",
    height: "44px",
    backgroundColor: "#E0E0E0",
    '@media (max-width: 700px)': {
      display: "none",
    },
  },
  heroValueItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "fit-content",
    maxWidth: "230px",
    minWidth: 0,
    textAlign: "left",
  },
  heroValueTitle: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    color: "#242424",
    whiteSpace: "nowrap",
    '@media (max-width: 400px)': {
      whiteSpace: "normal",
    },
  },
  heroValueDescription: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "16px",
    color: "#707070",
    // Descriptions carry an explicit newline so each renders on exactly two lines.
    whiteSpace: "pre-line",
    '@media (max-width: 400px)': {
      whiteSpace: "normal",
    },
  },
  templateViewAllLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#335CCC",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    textDecorationLine: "none",
    whiteSpace: "nowrap",
    ':hover': {
      textDecorationLine: "none",
    },
  },
  templateViewAllIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#335CCC",
    width: "20px",
    height: "20px",
    flexShrink: 0,
  },
  templateCardButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
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
  },
  templateVoteBar: {
    marginTop: "0",
    flexShrink: 0,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
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
  emptyState: {
    ...shorthands.padding("40px", "0"),
    textAlign: "center",
    fontSize: "14px",
    lineHeight: "20px",
    color: "#616161",
  },
  // --- Figma "Research & playbooks" two-pane layout ---
  researchTwoPane: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    maxWidth: "1024px",
    marginLeft: "auto",
    marginRight: "auto",
    '@media (max-width: 900px)': {
      flexDirection: "column",
    },
  },
  researchLeftPane: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    flex: 1,
    minWidth: 0,
    ...shorthands.padding("0", "0"),
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
  researchAccordionHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: "12px",
    ...shorthands.padding("20px", "0px", "20px", "16px"),
    ...shorthands.border("none"),
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "ease",
  },
  researchAccordionHeaderSelected: {
    backgroundColor: "#FFFFFF",
  },
  researchAccordionHeaderUnselected: {
    ':hover': {
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
  },
  researchAccordionAccent: {
    width: "3px",
    flexShrink: 0,
    alignSelf: "stretch",
    backgroundColor: "#335CCC",
    ...shorthands.borderRadius("2px"),
  },
  researchAccordionItemContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: 0,
  },
  researchAccordionTitle: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
  },
  researchAccordionTitleLabel: {
    fontWeight: 700,
    color: "#242424",
  },
  researchAccordionTitleSubtitle: {
    fontWeight: 400,
    color: "#616161",
  },
  researchAccordionBodyText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#616161",
  },
  researchRightPane: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    ...shorthands.padding("24px", "40px"),
    ...shorthands.borderRadius("12px"),
    boxShadow: "0 0 2px rgba(0,0,0,0.10), 0 6px 20px rgba(0,0,0,0.05)",
    '@media (max-width: 900px)': {
      ...shorthands.padding("24px", "24px"),
    },
  },
  researchItem: {
    display: "flex",
    // Stacked rows rather than a text column beside an action column: the
    // title then spans the full card width instead of being squeezed by a
    // sidebar, so it no longer truncates and the subtext needs fewer lines.
    flexDirection: "column",
    gap: "8px",
    ...shorthands.padding("24px", "0"),
    ...shorthands.borderBottom("1px", "solid", "#E0E0E0"),
    // The last card sits directly above the "View all" link, so it needs no rule.
    ':last-of-type': {
      borderBottomStyle: "none",
    },
  },
  // Chips on the left, the action button pinned right and centred against them.
  researchItemTopRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  // Subtext on the left, votes pinned right and level with its last line.
  researchItemBottomRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
  },
  researchItemChips: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "8px",
    minWidth: 0,
  },
  researchItemChip: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    ...shorthands.padding("4px", "8px"),
    ...shorthands.borderRadius("100px"),
    minHeight: "24px",
  },
  researchItemTitleLink: {
    display: "block",
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
  researchCardButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    minHeight: "32px",
    flexShrink: 0,
    // The button is 32px against a 24px chip row. Absorb the difference so it
    // centres on the chips without making the row, and every card, 8px taller.
    marginTop: "-4px",
    marginBottom: "-4px",
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
  },
  researchViewAllLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "flex-start",
    marginTop: "auto",
    paddingTop: "24px",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    color: "#335CCC",
    textDecorationLine: "none",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  researchItemSubtext: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "16px",
    color: "#616161",
    minWidth: 0,
  },
  roadmapSectionContent: {
    gap: "24px",
  },
  roadmapTabBar: {
    display: "flex",
    alignItems: "stretch",
    backgroundColor: "#ffffff",
    ...shorthands.borderRadius("8px"),
    overflowX: "auto",
    scrollbarWidth: "none",
    '::-webkit-scrollbar': {
      display: "none",
    },
  },
  roadmapTab: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexShrink: 0,
    whiteSpace: "nowrap",
    backgroundColor: "transparent",
    color: "#242424",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
    cursor: "pointer",
    ...shorthands.padding("12px", "16px"),
    ...shorthands.border("none"),
    ':hover': {
      color: "#0E1726",
    },
    '::after': {
      content: '""',
      position: "absolute",
      left: "12px",
      right: "12px",
      bottom: 0,
      height: "3px",
      ...shorthands.borderRadius("9999px"),
      backgroundColor: "transparent",
    },
  },
  roadmapTabActive: {
    color: "#242424",
    fontWeight: 600,
    '::after': {
      backgroundColor: "#335CCC",
    },
  },
  roadmapTabDescription: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#242424",
  },
  roadmapDetailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "24px",
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
    gap: "16px",
    minHeight: "148px",
    backgroundColor: "#ffffff",
    ...shorthands.border("1px", "solid", "#E0E0E0"),
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("24px"),
    boxSizing: "border-box",
  },
  roadmapDetailCardWide: {
    gridColumn: "span 2",
    '@media (max-width: 600px)': {
      gridColumn: "auto",
    },
  },
  roadmapCardIconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    backgroundColor: "#ffffff",
    ...shorthands.border("1px", "solid", "#E0E0E0"),
    ...shorthands.borderRadius("5px"),
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
    scrollSnapType: "none",
    scrollPaddingInline: "0",
    marginLeft: "0",
    marginRight: "0",
    paddingTop: "12px",
    paddingBottom: "24px",
    paddingLeft: "0",
    paddingRight: "24px",
    scrollbarWidth: "none",
    '::-webkit-scrollbar': {
      display: "none",
    },
    '@media (min-width: 1025px)': {
      marginLeft: "calc(50% - 50vw)",
      marginRight: "calc(50% - 50vw)",
      paddingRight: "calc((100vw - 1024px) / 2 + 24px)",
    },
    '@media (max-width: 600px)': {
      marginLeft: "0",
      marginRight: "0",
      ...shorthands.padding("4px", "4px"),
    },
  },
  featuredEdgeSpacer: {
    flex: "0 0 max(0px, calc((100vw - 1024px) / 2))",
    marginRight: "-20px",
    pointerEvents: "none",
    '@media (max-width: 1024px)': {
      flexBasis: "0",
      marginRight: "0",
    },
  },
  featuredCard: {
    flex: "0 0 336px",
    minHeight: "212px",
    scrollSnapAlign: "start",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
  featuredCardButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
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
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "0",
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
  featuredTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  featuredDescription: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#424242",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1,
  },
  featuredFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: "16px",
  },
  featuredDate: {
    fontSize: "12px",
    lineHeight: "16px",
    color: "#707070",
    whiteSpace: "nowrap",
  },
  featuredNav: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    width: "100%",
    '@media (max-width: 600px)': {
      width: "100%",
    },
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

function FeaturedDescription({ text, className }: { text: string; className: string }) {
  const nodeRef = useRef<HTMLParagraphElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const measure = useCallback(() => {
    const el = nodeRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight - el.clientHeight > 1);
    }
  }, []);

  const setRef = useCallback(
    (el: HTMLParagraphElement | null) => {
      nodeRef.current = el;
      if (el) measure();
    },
    [measure],
  );

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const paragraph = (
    <p ref={setRef} className={className}>
      {text}
    </p>
  );

  if (!isTruncated) {
    return paragraph;
  }

  return (
    <Tooltip content={text} relationship="description" showDelay={2000} withArrow>
      {paragraph}
    </Tooltip>
  );
}

function App() {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState<(typeof sectionTabs)[number]["id"] | null>(null);
  const [ghStats, setGhStats] = useState<{ stars: string; watchers: string }>({ stars: "—", watchers: "—" });
  const [templateFilter, setTemplateFilter] = useState<TemplateImpactFilter>("Featured");
  const [codeFilter, setCodeFilter] = useState<CodeHomeTechFilter>("Featured");
  const [activeRoadmapTab, setActiveRoadmapTab] = useState<string>(roadmapItems[0].id);
  const [openResearchPanel, setOpenResearchPanel] = useState<"Research" | "Playbook" | null>("Research");

  useEffect(() => {
    logPageView();
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchBadgeCount("https://img.shields.io/github/stars/microsoft/AI-in-One-Dashboard.json"),
      fetchBadgeCount("https://img.shields.io/github/watchers/microsoft/AI-in-One-Dashboard.json"),
    ])
      .then(([stars, watchers]) => {
        if (!cancelled) {
          setGhStats({
            stars,
            watchers,
          });
        }
      })
      .catch((error: unknown) => {
        console.warn("Unable to load AI in One Dashboard GitHub counts", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const orderedTemplates = useMemo(() => {
    const map = new Map(templates.map((item) => [item.id, item]));
    return templateOrder.map((id) => map.get(id)).filter(Boolean) as typeof templates;
  }, []);

  const orderedResearch = useMemo(() => {
    const map = new Map(research.map((item) => [item.id, item]));
    return researchOrder.map((id) => map.get(id)).filter(Boolean) as typeof research;
  }, []);

  const orderedCodeResources = useMemo(() => {
    const map = new Map(resources.map((item) => [item.id, item]));
    return codeHomeOrder.map((id) => map.get(id)).filter(Boolean) as typeof resources;
  }, []);

  const visibleResearchItems = useMemo(
    () => orderedResearch.filter((item) => item.kind === openResearchPanel).slice(0, 3),
    [orderedResearch, openResearchPanel],
  );
  const activeResearchPanel = researchPanels.find((panel) => panel.kind === openResearchPanel);

  const visibleTemplates = useMemo(
    () =>
      templateFilter === "Featured"
        ? orderedTemplates
        : orderedTemplates.filter((item) => item.impact.includes(templateFilter)),
    [orderedTemplates, templateFilter],
  );

  const visibleResources = useMemo(
    () =>
      (codeFilter === "Featured"
        ? orderedCodeResources
        : orderedCodeResources.filter((item) => item.tech.includes(codeFilter))
      ).slice(0, maxHomeCodeCards),
    [codeFilter, orderedCodeResources],
  );

  const activeRoadmap = roadmapItems.find((item) => item.id === activeRoadmapTab) ?? roadmapItems[0];

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

  // Gate the arrows on the full set rather than the filtered one. A pill that
  // narrows the row to three or fewer cards keeps its arrows so the section
  // does not change height as the user moves between pills.
  const showFeaturedNav = featuredItems.length > FEATURED_CARDS_PER_VIEW;

  const tabsShellRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef<(typeof sectionTabs)[number]["id"] | null>(null);
  const suppressSpyRef = useRef(false);
  const suppressTimerRef = useRef<number | undefined>(undefined);
  const settleTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const ids = sectionTabs.map((tab) => tab.id);
    let ticking = false;

    const computeActive = () => {
      ticking = false;
      if (suppressSpyRef.current) return;

      const tabsEl = tabsShellRef.current;
      const stickyTop = tabsEl ? parseFloat(getComputedStyle(tabsEl).top) || 48 : 48;
      const barHeight = tabsEl?.offsetHeight ?? 48;
      // Reference line sits just below the sticky header + tabs bar. A section
      // is "active" once its top has scrolled above this line.
      const line = stickyTop + barHeight + 12;

      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;

      // No tab is active until a section actually reaches the reference line,
      // so nothing is highlighted while the hero is in view.
      let currentId: (typeof sectionTabs)[number]["id"] | null = null;
      if (atBottom) {
        // Ensure the final section can activate even if it is too short to
        // reach the reference line.
        currentId = ids[ids.length - 1];
      } else {
        // Sections are in document order, so the last one whose top is above
        // the line is the current section. This is monotonic and never
        // flip-flops between neighbours.
        for (const id of ids) {
          const element = document.getElementById(id);
          if (!element) continue;
          if (element.getBoundingClientRect().top <= line) {
            currentId = id;
          } else {
            break;
          }
        }
      }

      if (currentId !== activeSectionRef.current) {
        activeSectionRef.current = currentId;
        setActiveTab(currentId);
        if (currentId) {
          logClick(TelemetryEvents.SectionView, { section: currentId });
        }
      }
    };

    const onScroll = () => {
      // While a click-driven smooth scroll is in flight, keep the clicked tab
      // active and release the spy only once the scroll settles.
      if (suppressSpyRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = window.setTimeout(() => {
          suppressSpyRef.current = false;
        }, 120);
      }
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(computeActive);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    computeActive();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToSection = (sectionId: (typeof sectionTabs)[number]["id"]) => {
    activeSectionRef.current = sectionId;
    setActiveTab(sectionId);
    logClick(TelemetryEvents.TabClick, { tab: sectionId });
    // Suppress scroll-spy so the clicked tab stays active through the smooth
    // scroll instead of flickering across intermediate sections. Suppression is
    // lifted when the scroll settles (see onScroll); this timer is only a cap
    // in case no scroll movement occurs (e.g. the target is already in view).
    suppressSpyRef.current = true;
    window.clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = window.setTimeout(() => {
      suppressSpyRef.current = false;
    }, 2000);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.tabsShell} ref={tabsShellRef}>
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

      <header className={styles.hero}>
        <div className={styles.heroArtColumn} aria-hidden="true">
          <div className={styles.heroArt} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <h1 className={styles.heroTitle}>
              Frontier analytics for
              <br />
              <span className={styles.heroTitleAccent}>Copilot and agents</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A hands-on hub to build with, learn from, and preview what's next in Copilot Analytics.
            </p>
          </div>

          <div className={styles.heroDivider} aria-hidden="true" />

          <div className={styles.heroValuesRow}>
            {heroValues.map(({ title, description }, index) => (
              <Fragment key={title}>
                {index > 0 && <span className={styles.heroValueDivider} aria-hidden="true" />}
                <div className={styles.heroValueItem}>
                  <h2 className={styles.heroValueTitle}>{title}</h2>
                  <p className={styles.heroValueDescription}>{description}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </header>

      <section id="whats-new" className={mergeClasses(styles.section, styles.sectionWhatsNewBg)}>
        <div className={mergeClasses(styles.sectionContent, styles.featuredSectionContent)}>
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
                      {(featuredCounts.get(kind) ?? 0) > 0 ? `${featuredCounts.get(kind)} new` : "0 new"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {visibleFeatured.length > 0 ? (
            <>
              <div className={styles.featuredRow} ref={featuredRowRef}>
                <div className={styles.featuredEdgeSpacer} aria-hidden="true" />
                {visibleFeatured.map((item) => {
                  const chip = featuredChipByKind[item.kind];
                  const ctaLabel = {
                    Template: "View template",
                    Code: "View code",
                    Research: "View report",
                    Playbook: "View playbook",
                  }[item.kind];
                  return (
                    <article key={item.id} className={styles.featuredCard}>
                      <div className={styles.featuredChips}>
                        <span className={styles.featuredTag} style={{ backgroundColor: chip.bg, color: chip.fg }}>
                          {chip.label}
                        </span>
                        <span className={styles.featuredDate}>{formatRelativeDate(item.addedOn)}</span>
                      </div>
                      <h3 className={styles.featuredTitle}>{item.title}</h3>
                      <FeaturedDescription text={item.description} className={styles.featuredDescription} />
                      <div className={styles.featuredFooter}>
                        <a
                          className={styles.featuredCardButton}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => logClick(TelemetryEvents.TemplateViewClick, { template: item.sourceId })}
                        >
                          {ctaLabel}
                          <Open16Filled fontSize={12} />
                        </a>
                        <VoteBar cardId={item.sourceId} variant="inline" />
                      </div>
                    </article>
                  );
                })}
              </div>

              {showFeaturedNav && (
                <div className={styles.featuredNav}>
                  <button type="button" className={styles.featuredNavButton} aria-label="Scroll previous" onClick={() => scrollFeatured(-1)}>
                    <ChevronLeft20Regular fontSize={18} />
                  </button>
                  <button type="button" className={styles.featuredNavButton} aria-label="Scroll next" onClick={() => scrollFeatured(1)}>
                    <ChevronRight20Regular fontSize={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className={styles.featuredDate}>No new resources right now — check back soon.</p>
          )}
        </div>
      </section>

      <section id="templates" className={mergeClasses(styles.section, styles.sectionTemplateBg)}>
        <div className={mergeClasses(styles.sectionContent, styles.templateSectionContent)}>
          <div className={styles.sectionTitleArea}>
            <p className={styles.eyebrow}>Template library</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>Pick a template, start building</h2>
              <button
                className={styles.templateViewAllLink}
                onClick={() => {
                  logClick(TelemetryEvents.TabClick, { tab: "view-all-templates" });
                  window.location.hash = "#/templates";
                }}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                View all templates
                <span className={styles.templateViewAllIcon}><ChevronRight20Filled fontSize={20} /></span>
              </button>
            </div>
            <p className={mergeClasses(styles.sectionDescription, styles.templateSectionDescription)}>
              Step-by-step templates to build dashboards across adoption, usage, impact, and business value, using data sources beyond Viva.
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
                {templateFilterLabelHome[cat]}
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
              const copyOverride = templateHomeCopyOverrides[item.id] ?? {};
              const templateTitle = copyOverride.title ?? item.title;
              const templateDescription = copyOverride.description ?? item.description;

              return (
                <article
                  key={item.id}
                  className={mergeClasses(styles.templateCard, isFeatured && styles.templateCardFeatured)}
                >
                  {isFeatured && item.image ? <img className={styles.templateCardImage} src={item.image} alt="" /> : null}

                  <div className={styles.templateCardContent}>
                    {meta.badges?.length ? (
                      <div className={styles.badgeRow}>
                        {meta.badges.map((badge) => (
                          <span
                            key={badge.text}
                            className={mergeClasses(
                              styles.badge,
                              badge.tone === "green" && styles.badgeGreen,
                              badge.tone === "teal" && styles.badgeTeal,
                              badge.tone === "purple" && styles.badgePurple,
                              badge.tone === "orange" && styles.badgeOrange,
                              badge.tone === "red" && styles.badgeRed,
                              badge.tone === "blue" && styles.badgeBlue,
                            )}
                          >
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className={styles.templateBody}>
                      <div className={styles.templateCardContent}>
                        <h3 className={styles.templateTitle}>{templateTitle}</h3>
                        <p className={styles.templateDescription}>{templateDescription}</p>
                      </div>

                      {meta.stats?.length ? (
                        <>
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

                      {(item.videoUrl || item.setupVideoUrl) ? (
                        <div className={styles.templateVideoRow}>
                          {item.videoUrl ? (
                            <DemoVideoButton
                              id={item.id}
                              title={item.title}
                              videoUrl={item.videoUrl}
                              className={styles.templateCardButton}
                            />
                          ) : null}
                          {item.setupVideoUrl ? (
                            <DemoVideoButton
                              id={`${item.id}-setup`}
                              title={item.title}
                              videoUrl={item.setupVideoUrl}
                              label="Watch setup"
                              className={styles.templateCardButton}
                            />
                          ) : null}
                        </div>
                      ) : null}
                      <div className={styles.templateActionsRow}>
                        <a className={styles.templateCardButton} href={item.url} target="_blank" rel="noreferrer" onClick={() => logClick(TelemetryEvents.TemplateViewClick, { template: item.id })}>
                          View template
                          <Open16Filled fontSize={12} />
                        </a>
                        <VoteBar cardId={item.id} variant="inline" className={styles.templateVoteBar} />
                      </div>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
          )}
        </div>
      </section>

      <section id="sample-code" className={mergeClasses(styles.section, styles.sectionCodeBg)}>
        <div className={mergeClasses(styles.sectionContent, styles.codeSectionContent)}>
          <div className={styles.sectionTitleArea}>
            <p className={styles.eyebrow}>Sample code</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>Grab the code, make it yours</h2>
              <button
                className={styles.templateViewAllLink}
                onClick={() => {
                  logClick(TelemetryEvents.TabClick, { tab: "view-all-codes" });
                  window.location.hash = "#/codes";
                }}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                View all codes
                <ChevronRight20Filled fontSize={20} />
              </button>
            </div>
            <p className={mergeClasses(styles.sectionDescription, styles.codeSectionDescription)}>
              Runnable scripts, prompt libraries, and analytical methods in Python, R, and Power BI, adapt them to your org's data.
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
              const meta = resourceMeta[item.id];
              const isWide = Boolean(meta?.wide);
              const description = codeHomeCopyOverrides[item.id]?.description ?? item.description;

              return (
                <article key={item.id} className={mergeClasses(styles.codeCard, isWide ? styles.codeCardWide : styles.codeCardSquare)}>
                  {isWide && item.image ? <img src={item.image} alt="" className={styles.codeCardWideImage} /> : null}

                  <div className={styles.codeCardBody}>
                    {meta?.badges?.length ? (
                      <div className={styles.badgeRow}>
                        {meta.badges.map((badge) => (
                          <span
                            key={badge.text}
                            className={mergeClasses(
                              styles.badge,
                              badge.tone === "green" && styles.badgeGreen,
                              badge.tone === "teal" && styles.badgeTeal,
                              badge.tone === "purple" && styles.badgePurple,
                              badge.tone === "orange" && styles.badgeOrange,
                              badge.tone === "red" && styles.badgeRed,
                            )}
                          >
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className={styles.templateCardContent}>
                      <h3 className={styles.codeTitle}>{item.title}</h3>
                      <p className={styles.codeDescription}>{description}</p>
                    </div>

                    <div className={styles.codeActionsRow}>
                      <a className={styles.codeCardButton} href={item.url} target="_blank" rel="noreferrer" onClick={() => logClick(TelemetryEvents.CodeViewClick, { resource: item.id })}>
                        View code
                        <Open16Filled fontSize={12} />
                      </a>
                      <VoteBar cardId={item.id} variant="inline" className={styles.codeVoteBar} />
                    </div>
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
                <h2 className={styles.researchMainHeading}>
                  Examples from
                  <br />
                  around the world
                </h2>
              </div>

              <div className={styles.researchAccordions}>
                {researchPanels.map((panel) => {
                  const isSelected = openResearchPanel === panel.kind;
                  return (
                    <button
                      key={panel.kind}
                      type="button"
                      className={mergeClasses(
                        styles.researchAccordionHeader,
                        isSelected
                          ? styles.researchAccordionHeaderSelected
                          : styles.researchAccordionHeaderUnselected,
                      )}
                      aria-pressed={isSelected}
                      onClick={() => setOpenResearchPanel(panel.kind)}
                    >
                      {isSelected && (
                        <span className={styles.researchAccordionAccent} aria-hidden="true" />
                      )}
                      <span className={styles.researchAccordionItemContent}>
                        <span className={styles.researchAccordionTitle}>
                          <span className={styles.researchAccordionTitleLabel}>{panel.label}</span>
                          <span className={styles.researchAccordionTitleSubtitle}> / {panel.subtitle}</span>
                        </span>
                        <span className={styles.researchAccordionBodyText}>{panel.body}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.researchRightPane}>
              {visibleResearchItems.map((item) => (
                <article key={item.id} className={styles.researchItem}>
                  <div className={styles.researchItemTopRow}>
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
                    <a
                      className={styles.researchCardButton}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => logClick(TelemetryEvents.ResearchViewClick, { research: item.id })}
                    >
                      {item.kind === "Playbook" ? "View playbook" : "View report"}
                      <Open16Filled fontSize={12} />
                    </a>
                  </div>
                  <a
                    className={styles.researchItemTitleLink}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logClick(TelemetryEvents.ResearchViewClick, { research: item.id })}
                  >
                    <h3 className={mergeClasses(styles.researchItemTitle, "research-item-title")}>{item.title}</h3>
                  </a>
                  <div className={styles.researchItemBottomRow}>
                    <p className={styles.researchItemSubtext}>{item.description}</p>
                    <VoteBar cardId={item.id} variant="inline" />
                  </div>
                </article>
              ))}
              {activeResearchPanel && (
                <a
                  className={styles.researchViewAllLink}
                  href="#/research"
                  onClick={() => logClick(TelemetryEvents.ResearchViewClick, { research: `view-all-${openResearchPanel}` })}
                >
                  {activeResearchPanel.linkLabel}
                  <ArrowRight16Regular fontSize={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="product-roadmap" className={mergeClasses(styles.section, styles.sectionRoadmapBg)}>
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="roadmapFlowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3F6CE9" />
              <stop offset="100%" stopColor="#764FF5" />
            </linearGradient>
          </defs>
        </svg>
        <div className={mergeClasses(styles.sectionContent, styles.roadmapSectionContent)}>
          <div className={styles.sectionTitleArea}>
            <p className={mergeClasses(styles.eyebrow, styles.eyebrowFeatured)}>Product roadmap</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>What's next for Copilot Analytics</h2>
            </div>
          </div>

          <div className={styles.roadmapTabBar} role="tablist" aria-label="Roadmap categories">
            {roadmapItems.map((item) => {
              const active = activeRoadmapTab === item.id;
              const TabIcon = active ? item.iconActive : item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={mergeClasses(styles.roadmapTab, active && styles.roadmapTabActive)}
                  onClick={() => { setActiveRoadmapTab(item.id); logClick(TelemetryEvents.TabClick, { tab: `roadmap-${item.id}` }); }}
                >
                  <TabIcon fontSize={20} style={active ? { color: "#335CCC" } : undefined} />
                  {item.title}
                </button>
              );
            })}
          </div>

          <p className={styles.roadmapTabDescription}>{activeRoadmap.description}</p>

          <div className={styles.roadmapDetailGrid}>
            {(activeRoadmap.details ?? []).map((detail) => (
              <article key={detail} className={mergeClasses(styles.roadmapDetailCard, detail.length > 60 && styles.roadmapDetailCardWide)}>
                <div className={styles.roadmapCardIconBox}>
                  <FlowSparkle20Regular className="roadmap-flow-icon" fontSize={20} />
                </div>
                <h3 className={styles.roadmapTitle}>{detail}</h3>
              </article>
            ))}
          </div>

          <div className={styles.roadmapLinks}>
            <a className={styles.roadmapLink} href="https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=Microsoft%20Viva" target="_blank" rel="noreferrer">
              See detailed roadmap
              <Open16Regular fontSize={16} />
            </a>
            <a className={styles.roadmapLink} href="https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UODhQNTBPUkI2NUlRQU9VUzI0WkNPUTJSSi4u" target="_blank" rel="noreferrer">
              Share feedback
              <Open16Regular fontSize={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
