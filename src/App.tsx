import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@fluentui/react-components";
import {
  ArrowRight16Regular,
  ArrowTrendingText20Filled,
  ArrowTrendingText20Regular,
  ChartMultiple20Filled,
  ChartMultiple20Regular,
  ChevronLeft20Regular,
  ChevronRight16Regular,
  ChevronRight20Regular,
  Eye16Regular,
  FlowSparkle20Regular,
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
import { PortalButton, PortalCard, PortalPrimaryTabs, PortalTab, PortalTabList, PortalText } from "./portal-design";
import "./home.css";

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

const featuredChipByKind: Record<FeaturedKind, { label: string; badgeClass: string }> = {
  Template: { label: "Template", badgeClass: "labs-badge labs-badge--success" },
  Code: { label: "Sample code", badgeClass: "labs-badge labs-badge--brand" },
  Research: { label: "Research", badgeClass: "labs-badge labs-badge--warning" },
  Playbook: { label: "Playbook", badgeClass: "labs-badge" },
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
  "cowork-team-report",
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
  "cowork-team-report": {
    badges: [
      { text: "New", tone: "blue" },
      { text: "AI-impact", tone: "teal" },
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
      "Get started with R & Python utility scripts — exploratory data analysis, standard visualisations, and custom KPI generation from Business Analytics data.",
  },
  "advanced-analytics": {
    description: "Advanced analytical techniques and methods for deeper Business Analytics data.",
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

// Badge tones follow the subpages: status badges use the kit's status colors and topics stay neutral.
function templateBadgeClass(text: string): string {
  if (text === "Featured") return "labs-badge labs-badge--success";
  if (text === "New") return "labs-badge labs-badge--brand";
  return "labs-badge";
}

function codeBadgeClass(text: string): string {
  return text === "Featured" ? "labs-badge labs-badge--success" : "labs-badge labs-badge--brand";
}

// Smooth scrolling is skipped for visitors who ask for reduced motion.
function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

// The class clamps the text to three lines; a tooltip shows the full text when it's cut.
function ClampedDescription({ text, className }: { text: string; className: string }) {
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
    // The kit's web font can finish loading after the first measurement and move the line breaks.
    document.fonts.addEventListener("loadingdone", measure);
    document.fonts.ready.then(measure);
    return () => {
      window.removeEventListener("resize", measure);
      document.fonts.removeEventListener("loadingdone", measure);
    };
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

  // With nothing new, the What's new section and its tab are left out rather than shown empty.
  const hasFeatured = featuredItems.length > 0;
  const visibleSectionTabs = useMemo(
    () => (hasFeatured ? [...sectionTabs] : sectionTabs.filter((tab) => tab.id !== "whats-new")),
    [hasFeatured],
  );

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
    featuredRowRef.current?.scrollBy({ left: dir * 340, behavior: scrollBehavior() });
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
    const ids = visibleSectionTabs.map((tab) => tab.id);
    let ticking = false;

    const computeActive = () => {
      ticking = false;
      if (suppressSpyRef.current) return;

      const tabsEl = tabsShellRef.current;
      const parsedTop = tabsEl ? parseFloat(getComputedStyle(tabsEl).top) : NaN;
      const stickyTop = Number.isNaN(parsedTop) ? 48 : parsedTop;
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
  }, [visibleSectionTabs]);

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
    document.getElementById(sectionId)?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  };

  const roadmapTabOptions = roadmapItems.map((item) => {
    const Icon = activeRoadmapTab === item.id ? item.iconActive : item.icon;
    return { value: item.id, label: item.title, id: `roadmap-tab-${item.id}`, icon: <Icon /> };
  });

  return (
    <div className="labs-home">
      <div className="labs-home__tabs-shell" ref={tabsShellRef}>
        <div className="labs-container">
          {/* Tabs jump to a section and follow the scroll position. Arrow keys move focus; Enter or Space jumps. */}
          <PortalTabList
            className="service-tabs labs-home__tabs"
            aria-label="Sections"
            selectedValue={activeTab ?? ""}
            selectTabOnFocus={false}
          >
            {visibleSectionTabs.map((tab) => (
              <PortalTab
                key={tab.id}
                value={tab.id}
                className={`service-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => scrollToSection(tab.id)}
              >
                {tab.label}
              </PortalTab>
            ))}
          </PortalTabList>
        </div>
      </div>

      {/* Each block keeps the centred column; the rules between them run the full page width. */}
      <div className="labs-home__body">
        <div className="labs-container">
          <header className="labs-hero">
            <div className="labs-hero__art" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}images/hero-illustration.svg`} alt="" />
            </div>

            <div className="labs-hero__header">
              <h1 className="labs-hero__title">
                Frontier analytics for
                <br />
                Copilot and agents
              </h1>
              <p className="labs-hero__subtitle">
                A hands-on hub to build with, learn from, and preview what's next in Copilot Analytics.
              </p>
            </div>
            <div className="labs-hero__divider" aria-hidden="true" />
            <div className="labs-hero__values">
              {heroValues.map(({ title, description }, index) => (
                <Fragment key={title}>
                  {index > 0 && <span className="labs-hero__value-divider" aria-hidden="true" />}
                  <div className="labs-hero__value">
                    <PortalText as="h2" textRole="reading" emphasis="semibold" className="labs-hero__value-title">
                      {title}
                    </PortalText>
                    <PortalText as="p" textRole="metadata" tone="secondary" className="labs-hero__value-description">
                      {description}
                    </PortalText>
                  </div>
                </Fragment>
              ))}
            </div>
          </header>
        </div>

        {hasFeatured && (
          <>
            <div className="labs-home__separator" aria-hidden="true" />

            <section id="whats-new" className="labs-container labs-home__section" aria-labelledby="whats-new-heading">
              <div className="labs-home__head">
                <p className="eyebrow">Featured</p>
                <PortalText as="h2" id="whats-new-heading" textRole="section-title">
                  See what's new and popular in labs
                </PortalText>
                <PortalText as="p" textRole="reading" tone="secondary" className="labs-home__description">
                  Newly added resources containing templates, sample codes, research, playbooks and demos.
                </PortalText>
              </div>
              {featuredKinds.length > 0 && (
                <div className="portal-segmented-control" role="group" aria-label="Filter new content">
                  <button type="button" aria-pressed={featuredFilter === "All"} onClick={() => setFeaturedFilter("All")}>
                    All
                  </button>
                  {featuredKinds.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={featuredFilter === kind}
                      onClick={() => setFeaturedFilter(kind)}
                    >
                      {featuredPillLabel[kind]}
                      <span className="labs-pill-dot" aria-hidden="true" />
                      <span>{(featuredCounts.get(kind) ?? 0) > 0 ? `${featuredCounts.get(kind)} new` : "0 new"}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="labs-featured__row" ref={featuredRowRef}>
                {visibleFeatured.map((item) => {
                  const chip = featuredChipByKind[item.kind];
                  const ctaLabel = {
                    Template: "View template",
                    Code: "View code",
                    Research: "View report",
                    Playbook: "View playbook",
                  }[item.kind];
                  return (
                    <PortalCard key={item.id} role="article" className="data-table-card labs-card labs-featured__card">
                      <div className="labs-featured__meta">
                        <span className={chip.badgeClass}>{chip.label}</span>
                        <PortalText textRole="metadata" tone="muted">
                          {formatRelativeDate(item.addedOn)}
                        </PortalText>
                      </div>
                      <PortalText as="h3" textRole="card-title" className="labs-card__title">
                        {item.title}
                      </PortalText>
                      <ClampedDescription text={item.description} className="labs-featured__description" />
                      <div className="labs-card__footer">
                        <a
                          className="secondary-button"
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${ctaLabel}: ${item.title} (opens in a new tab)`}
                          onClick={() => logClick(TelemetryEvents.TemplateViewClick, { template: item.sourceId })}
                        >
                          {ctaLabel}
                          <Open16Regular aria-hidden="true" />
                        </a>
                        <VoteBar cardId={item.sourceId} variant="inline" />
                      </div>
                    </PortalCard>
                  );
                })}
              </div>
              {showFeaturedNav && (
                <div className="labs-featured__nav">
                  <PortalButton
                    variant="secondary"
                    iconOnly
                    shape="circular"
                    aria-label="Scroll previous"
                    onClick={() => scrollFeatured(-1)}
                  >
                    <ChevronLeft20Regular />
                  </PortalButton>
                  <PortalButton
                    variant="secondary"
                    iconOnly
                    shape="circular"
                    aria-label="Scroll next"
                    onClick={() => scrollFeatured(1)}
                  >
                    <ChevronRight20Regular />
                  </PortalButton>
                </div>
              )}
            </section>
          </>
        )}

        <div className="labs-home__separator" aria-hidden="true" />

        <section id="templates" className="labs-container labs-home__section" aria-labelledby="templates-heading">
          <div className="labs-home__head">
            <p className="eyebrow">Template library</p>
            <div className="labs-home__heading-row">
              <PortalText as="h2" id="templates-heading" textRole="section-title">
                Pick a template, start building
              </PortalText>
              <a
                className="secondary-button"
                href="#/templates"
                onClick={() => logClick(TelemetryEvents.TabClick, { tab: "view-all-templates" })}
              >
                View all templates
                <ChevronRight16Regular aria-hidden="true" />
              </a>
            </div>
            <PortalText as="p" textRole="reading" tone="secondary" className="labs-home__description">
              Step-by-step templates to build dashboards across adoption, usage, impact, and business value, using data
              sources beyond Business Analytics.
            </PortalText>
          </div>
          <div className="portal-segmented-control" role="group" aria-label="Filter templates">
            {templateImpactFilters.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={templateFilter === cat}
                onClick={() => setTemplateFilter(cat)}
              >
                {templateFilterLabelHome[cat]}
              </button>
            ))}
          </div>
          {visibleTemplates.length === 0 ? (
            <PortalCard className="data-table-card labs-empty">
              <PortalText as="p" textRole="reading" tone="secondary">
                More templates are coming to this category soon.
              </PortalText>
            </PortalCard>
          ) : (
            <div className="labs-template-grid">
              {visibleTemplates.map((item) => {
                const meta = templateMeta[item.id] ?? {};
                const isFeatured = Boolean(meta.featured);
                const copyOverride = templateHomeCopyOverrides[item.id] ?? {};
                const templateTitle = copyOverride.title ?? item.title;
                const templateDescription = copyOverride.description ?? item.description;
                const viewLink = (
                  <a
                    className="secondary-button"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View template: ${templateTitle} (opens in a new tab)`}
                    onClick={() => logClick(TelemetryEvents.TemplateViewClick, { template: item.id })}
                  >
                    View template
                    <Open16Regular aria-hidden="true" />
                  </a>
                );
                return (
                  <PortalCard
                    key={item.id}
                    role="article"
                    className={`data-table-card labs-card${isFeatured ? " labs-template-card--featured" : ""}`}
                  >
                    {isFeatured && item.image ? (
                      <img
                        className={`labs-card__media${item.imageIsIllustration ? " labs-card__media--contain" : ""}`}
                        src={item.image}
                        alt=""
                      />
                    ) : null}
                    {meta.badges?.length ? (
                      <div className="labs-tag-row">
                        {meta.badges.map((badge) => (
                          <span key={badge.text} className={templateBadgeClass(badge.text)}>
                            {badge.text}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <PortalText as="h3" textRole="card-title" className="labs-card__title">
                      {templateTitle}
                    </PortalText>
                    <ClampedDescription text={templateDescription} className="labs-template-card__description" />
                    {meta.stats?.length ? (
                      <div className="labs-stats">
                        {meta.stats.map((stat) => {
                          let value = stat.value;
                          if (item.id === "aio-dashboard") {
                            if (stat.label === "Stars") value = ghStats.stars;
                            else if (stat.label === "Watching") value = ghStats.watchers;
                          }
                          return (
                            <div key={stat.label} className="labs-stats__item">
                              <PortalText textRole="card-title" className="labs-stats__value">
                                {stat.label === "Stars" && <Star16Filled aria-hidden="true" />}
                                {stat.label === "Watching" && <Eye16Regular aria-hidden="true" />}
                                {value}
                              </PortalText>
                              <PortalText textRole="metadata" tone="muted">
                                {stat.label}
                              </PortalText>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    {item.videoUrl || item.setupVideoUrl ? (
                      <div className="labs-card__footer labs-card__footer--stacked">
                        <div className="labs-card__actions">
                          {viewLink}
                          {item.videoUrl ? (
                            <DemoVideoButton id={item.id} title={item.title} videoUrl={item.videoUrl} />
                          ) : null}
                        </div>
                        <div className="labs-card__divider" aria-hidden="true" />
                        <div className="labs-card__meta-row">
                          {item.setupVideoUrl ? (
                            <DemoVideoButton
                              id={`${item.id}-setup`}
                              title={item.title}
                              videoUrl={item.setupVideoUrl}
                              label="Watch setup"
                              variant="subtle"
                              tone="brand"
                            />
                          ) : null}
                          <VoteBar cardId={item.id} variant="inline" />
                        </div>
                      </div>
                    ) : (
                      <div className="labs-card__footer">
                        {viewLink}
                        <VoteBar cardId={item.id} variant="inline" />
                      </div>
                    )}
                  </PortalCard>
                );
              })}
            </div>
          )}
        </section>

        <div className="labs-home__separator" aria-hidden="true" />

        <section id="sample-code" className="labs-container labs-home__section" aria-labelledby="sample-code-heading">
          <div className="labs-home__head">
            <p className="eyebrow">Sample code</p>
            <div className="labs-home__heading-row">
              <PortalText as="h2" id="sample-code-heading" textRole="section-title">
                Grab the code, make it yours
              </PortalText>
              <a
                className="secondary-button"
                href="#/codes"
                onClick={() => logClick(TelemetryEvents.TabClick, { tab: "view-all-codes" })}
              >
                View all codes
                <ChevronRight16Regular aria-hidden="true" />
              </a>
            </div>
            <PortalText as="p" textRole="reading" tone="secondary" className="labs-home__description">
              Runnable scripts, prompt libraries, and analytical methods in Python, R, and Power BI, adapt them to your
              org's data.
            </PortalText>
          </div>
          <div className="portal-segmented-control" role="group" aria-label="Filter sample code">
            {codeHomeTechFilters.map((cat) => (
              <button key={cat} type="button" aria-pressed={codeFilter === cat} onClick={() => setCodeFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>
          {visibleResources.length === 0 ? (
            <PortalCard className="data-table-card labs-empty">
              <PortalText as="p" textRole="reading" tone="secondary">
                More sample code is coming to this category soon.
              </PortalText>
            </PortalCard>
          ) : (
            <div className="labs-code-grid">
              {visibleResources.map((item) => {
                const meta = resourceMeta[item.id];
                const isWide = Boolean(meta?.wide);
                const description = codeHomeCopyOverrides[item.id]?.description ?? item.description;
                return (
                  <PortalCard
                    key={item.id}
                    role="article"
                    className={`data-table-card labs-card labs-code-card${isWide ? " labs-code-card--wide" : ""}`}
                  >
                    {isWide && item.image ? <img className="labs-code-card__image" src={item.image} alt="" /> : null}
                    <div className="labs-code-card__body">
                      {meta?.badges?.length ? (
                        <div className="labs-tag-row">
                          {meta.badges.map((badge) => (
                            <span key={badge.text} className={codeBadgeClass(badge.text)}>
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <PortalText as="h3" textRole="card-title" className="labs-card__title">
                        {item.title}
                      </PortalText>
                      <ClampedDescription text={description} className="labs-code-card__description" />
                      <div className="labs-card__footer">
                        <a
                          className="secondary-button"
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View code: ${item.title} (opens in a new tab)`}
                          onClick={() => logClick(TelemetryEvents.CodeViewClick, { resource: item.id })}
                        >
                          View code
                          <Open16Regular aria-hidden="true" />
                        </a>
                        <VoteBar cardId={item.id} variant="inline" />
                      </div>
                    </div>
                  </PortalCard>
                );
              })}
            </div>
          )}
        </section>

        <div className="labs-home__separator" aria-hidden="true" />

        <section id="research" className="labs-container labs-home__section" aria-labelledby="research-heading">
          <div className="labs-research">
            <div className="labs-research__intro">
              <div className="labs-home__head">
                <p className="eyebrow">RESEARCH &amp; PLAYBOOKS</p>
                <PortalText as="h2" id="research-heading" textRole="section-title">
                  Examples from
                  <br />
                  around the world
                </PortalText>
              </div>
              <div className="labs-research__panels">
                {researchPanels.map((panel) => (
                  <button
                    key={panel.kind}
                    type="button"
                    className="labs-research__panel"
                    aria-pressed={openResearchPanel === panel.kind}
                    onClick={() => setOpenResearchPanel(panel.kind)}
                  >
                    <PortalText textRole="card-title">
                      {panel.label}
                      <PortalText textRole="reading" tone="secondary">
                        {" "}
                        / {panel.subtitle}
                      </PortalText>
                    </PortalText>
                    <PortalText textRole="support" tone="secondary">
                      {panel.body}
                    </PortalText>
                  </button>
                ))}
              </div>
            </div>
            <PortalCard className="data-table-card labs-research__list">
              {visibleResearchItems.map((item) => {
                const viewLabel = item.kind === "Playbook" ? "View playbook" : "View report";
                return (
                  <article key={item.id} className="labs-research__item">
                    <div className="labs-research__row">
                      <div className="labs-tag-row">
                        {(researchTags[item.id] ?? []).map((tag, index) => (
                          <span key={tag.text} className={index === 0 ? "labs-badge labs-badge--brand" : "labs-badge"}>
                            {tag.text}
                          </span>
                        ))}
                      </div>
                      <a
                        className="secondary-button"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${viewLabel}: ${item.title} (opens in a new tab)`}
                        onClick={() => logClick(TelemetryEvents.ResearchViewClick, { research: item.id })}
                      >
                        {viewLabel}
                        <Open16Regular aria-hidden="true" />
                      </a>
                    </div>
                    <PortalText as="h3" textRole="card-title" className="labs-card__title">
                      {item.title}
                    </PortalText>
                    <div className="labs-research__row">
                      <PortalText as="p" textRole="support" tone="secondary">
                        {item.description}
                      </PortalText>
                      <VoteBar cardId={item.id} variant="inline" />
                    </div>
                  </article>
                );
              })}
              {activeResearchPanel && (
                <a
                  className="labs-link labs-link--standalone labs-research__all"
                  href="#/research"
                  onClick={() =>
                    logClick(TelemetryEvents.ResearchViewClick, { research: `view-all-${openResearchPanel}` })
                  }
                >
                  {activeResearchPanel.linkLabel}
                  <ArrowRight16Regular aria-hidden="true" />
                </a>
              )}
            </PortalCard>
          </div>
        </section>

        <div className="labs-home__separator" aria-hidden="true" />

        <section id="product-roadmap" className="labs-container labs-home__section" aria-labelledby="product-roadmap-heading">
          <div className="labs-home__head">
            <p className="eyebrow">Product roadmap</p>
            <PortalText as="h2" id="product-roadmap-heading" textRole="section-title">
              What's next for Copilot Analytics
            </PortalText>
          </div>
          <PortalPrimaryTabs
            options={roadmapTabOptions}
            value={activeRoadmap.id}
            onChange={(id) => {
              setActiveRoadmapTab(id);
              logClick(TelemetryEvents.TabClick, { tab: `roadmap-${id}` });
            }}
            ariaLabel="Roadmap categories"
            panelId="roadmap-panel"
          />
          {/* The panel has no controls of its own, so it takes focus after the tabs. */}
          <div
            role="tabpanel"
            id="roadmap-panel"
            aria-labelledby={`roadmap-tab-${activeRoadmap.id}`}
            tabIndex={0}
            className="labs-roadmap__panel"
          >
            <PortalText as="p" textRole="reading" tone="secondary">
              {activeRoadmap.description}
            </PortalText>
            <div className="labs-roadmap__grid">
              {(activeRoadmap.details ?? []).map((detail) => (
                <PortalCard
                  key={detail}
                  role="article"
                  className={`data-table-card labs-card labs-roadmap__item${detail.length > 60 ? " labs-roadmap__item--wide" : ""}`}
                >
                  <span className="labs-roadmap__icon" aria-hidden="true">
                    <FlowSparkle20Regular />
                  </span>
                  <PortalText as="h3" textRole="card-title">
                    {detail}
                  </PortalText>
                </PortalCard>
              ))}
            </div>
          </div>
          <div className="labs-roadmap__links">
            <a
              className="labs-link labs-link--standalone"
              href="https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=Microsoft%20Viva"
              target="_blank"
              rel="noreferrer"
              aria-label="See detailed roadmap (opens in a new tab)"
            >
              See detailed roadmap
              <Open16Regular aria-hidden="true" />
            </a>
            <a
              className="labs-link labs-link--standalone"
              href="https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UODhQNTBPUkI2NUlRQU9VUzI0WkNPUTJSSi4u"
              target="_blank"
              rel="noreferrer"
              aria-label="Share feedback (opens in a new tab)"
            >
              Share feedback
              <Open16Regular aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
