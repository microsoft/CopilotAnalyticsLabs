import {
  BoardSplit24Regular,
  DataTrending24Regular,
  Sparkle24Regular,
  DocumentBulletList24Regular,
  PersonBoard24Regular,
  PeopleStar24Regular,
} from "@fluentui/react-icons";
import addEditShareIcon from "./assets/add-edit-share.webp";

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType;
  image?: string;
  /** ISO date (YYYY-MM-DD) the item was added. Drives the "What's new" section. */
  addedOn?: string;
  /** Product family, used by the dedicated Template Library page "Type" filter. */
  type: "Copilot" | "Business" | "GitHub";
  /** Impact scope tags, used by the Template Library "Impact" filters. */
  impact: ("AI Impact" | "Org wide" | "Individual" | "Team")[];
  /** Thematic sections the template belongs to on the Template Library page. */
  collections: ("AI Business Value" | "Microsoft 365")[];
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType;
  category: "Code" | "Prompts";
  image?: string;
  addedOn?: string;
  /** Technology tags, used by the home Sample Code section + page "Technology" filter. */
  tech: CodeTechTag[];
  /** Domain tags, used by the dedicated Sample Code page "Domain" filter. */
  domain: CodeDomainTag[];
  /** Thematic sections the sample code belongs to on the Sample Code page. */
  collections: ("Analytics" | "Export")[];
}

export type CodeTechTag =
  | "Python"
  | "R"
  | "Power BI"
  | "AI-assisted";

export type CodeDomainTag =
  | "Adoption & Usage"
  | "Impact & ROI"
  | "Copilot & Agents"
  | "Advanced / ML";

export interface ResearchItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType;
  ctaLabel?: string;
  /** Whether this item is a research report or an adoption/methodology playbook. */
  kind: "Research" | "Playbook";
  addedOn?: string;
  /** Domain tags, used by the dedicated Research & Playbooks page "Domain" filter. */
  domain: ResearchDomainTag[];
  /** Content type tags, used by the Research & Playbooks page "Content type" filter. */
  contentType: ResearchContentTypeTag[];
}

export type ResearchDomainTag =
  | "Copilot Adoption"
  | "Agent Analytics"
  | "Business Value"
  | "Productivity"
  | "AI Transformation";

export type ResearchContentTypeTag =
  | "Org wide"
  | "Industry wide"
  | "Framework"
  | "Benchmark";

// "Domain" filter tags for the dedicated Research & Playbooks page ("All" shows all).
export const researchDomainFilters = [
  "All",
  "Copilot Adoption",
  "Agent Analytics",
  "Business Value",
  "Productivity",
  "AI Transformation",
] as const;
export type ResearchDomainFilter = (typeof researchDomainFilters)[number];

// "Content type" filter tags for the dedicated Research & Playbooks page ("All" shows all).
export const researchContentTypeFilters = [
  "All",
  "Org wide",
  "Industry wide",
  "Framework",
  "Benchmark",
] as const;
export type ResearchContentTypeFilter = (typeof researchContentTypeFilters)[number];

const base = import.meta.env.BASE_URL;

export const templates: TemplateItem[] = [
  {
    id: "aio-dashboard",
    title: "AI in One Dashboard",
    description:
      "Comprehensive Copilot and Agent analytics covering adoption, usage, impact, and ROI — all in a single Power BI dashboard.",
    url: "https://github.com/microsoft/AI-in-One-Dashboard#-dashboard-preview",
    icon: BoardSplit24Regular,
    image: `${base}images/card-aio-featured.png`,
    addedOn: "2026-07-05",
    type: "Copilot",
    impact: ["AI Impact", "Org wide"],
    collections: ["AI Business Value"],
  },
  {
    id: "github-copilot-impact-org",
    title: "GitHub Copilot Impact Report (Org Level)",
    description:
      "Org-wide GitHub Copilot usage and productivity impact analysis with seat utilization and code completion metrics.",
    url: "https://github.com/microsoft/GitHubCopilotImpact#-github-copilot-impact",
    icon: DataTrending24Regular,
    image: `${base}images/card-github-copilot-org.png`,
    addedOn: "2026-06-23",
    type: "GitHub",
    impact: ["AI Impact", "Org wide"],
    collections: ["AI Business Value"],
  },
  {
    id: "cowork-value-estimator",
    title: "Cowork Value Estimator",
    description:
      "Your personal Copilot Cowork impact report — research-anchored Time Saved, professional-services-equivalent value, and work mapped to Jobs, Business Processes, and the four Value Pillars.",
    url: "https://github.com/microsoft/What-I-did-with-Cowork#option-1--let-cowork-install-it-for-you-easiest",
    icon: Sparkle24Regular,
    image: `${base}images/card-ai-business-value.png`,
    addedOn: "2026-07-15",
    type: "Copilot",
    impact: ["AI Impact", "Individual"],
    collections: ["AI Business Value"],
  },
  {
    id: "ai-business-value",
    title: "AI Business Value Dashboard",
    description:
      "Quantify business value of AI adoption across your organization with executive-ready visualizations.",
    url: "https://github.com/Keithland89/AI-Business-Value-Dashboard#-ai-business-value-dashboard",
    icon: Sparkle24Regular,
    image: `${base}images/card-github-copilot-personal.png`,
    addedOn: "2026-05-20",
    type: "Business",
    impact: ["AI Impact", "Org wide"],
    collections: ["AI Business Value"],
  },
  {
    id: "m365-copilot-personal",
    title: "Microsoft 365 Copilot Personal Insights",
    description:
      "Personal adoption and engagement dashboard tracking your Microsoft 365 Copilot usage journey and productivity gains.",
    url: "https://github.com/sbrandl1005/copilot-personal-dashboard#whats-in-this-report",
    icon: PersonBoard24Regular,
    image: `${base}images/card-m365-copilot-personal.png`,
    addedOn: "2026-05-10",
    type: "Copilot",
    impact: ["Individual"],
    collections: ["Microsoft 365"],
  },
  {
    id: "superuser-impact",
    title: "Super User Impact Report",
    description:
      "Analyze the work and productivity impact of super users across your organization with detailed pattern analysis.",
    url: "https://github.com/microsoft/superuserimpact#superuser-impact-report",
    icon: PeopleStar24Regular,
    image: `${base}images/card-superuser-impact.png`,
    addedOn: "2026-04-15",
    type: "Business",
    impact: ["Team", "Org wide"],
    collections: ["AI Business Value"],
  },
];

// Impact filter tags for the home "Template Library" section ("Featured" shows all).
export const templateImpactFilters = ["Featured", "AI Impact", "Org wide", "Individual", "Team"] as const;
export type TemplateImpactFilter = (typeof templateImpactFilters)[number];

// "Type" filter tags for the dedicated Template Library page ("All" shows all).
export const templateTypeFilters = ["All", "Copilot", "Business", "GitHub"] as const;
export type TemplateTypeFilter = (typeof templateTypeFilters)[number];

// "Impact" filter tags for the dedicated Template Library page ("All" shows all).
export const templatePageImpactFilters = ["All", "AI Impact", "Org wide", "Team", "Individual"] as const;
export type TemplatePageImpactFilter = (typeof templatePageImpactFilters)[number];

// Maps a page "Impact" filter label to the canonical impact tag stored on templates.
export function pageImpactToTag(filter: TemplatePageImpactFilter): TemplateItem["impact"][number] | null {
  if (filter === "All") return null;
  return filter;
}

export const resources: ResourceItem[] = [
  {
    id: "viva-insights-essentials",
    title: "Insights Analysis - Essentials",
    description:
      "Get started with R & Python utility scripts — exploratory data analysis, standard visualizations (bar charts, trend lines, network diagrams), and custom KPI generation from Insights data.",
    url: "https://microsoft.github.io/viva-insights-sample-code/essentials/",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: `${base}images/code-essentials.png`,
    addedOn: "2026-05-25",
    tech: ["Python", "R"],
    domain: ["Adoption & Usage"],
    collections: ["Analytics"],
  },
  {
    id: "advanced-analytics",
    title: "Advanced Analytics",
    description:
      "Machine learning & statistical modelling — Random Forest models for top-performer prediction, Information Value for feature selection, and pairwise chi-square tests for hypothesis testing.",
    url: "https://microsoft.github.io/viva-insights-sample-code/advanced/",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: `${base}images/code-advanced-analytics.png`,
    addedOn: "2026-06-08",
    tech: ["Python", "R"],
    domain: ["Impact & ROI", "Advanced / ML"],
    collections: ["Analytics"],
  },
  {
    id: "copilot-analytics",
    title: "Copilot Analytics",
    description:
      "Copilot-specific scripts — usage volume & breadth analysis, habituality scoring, Power User vs Habitual User segmentation, and adoption trend tracking across your organisation.",
    url: "https://microsoft.github.io/viva-insights-sample-code/copilot/",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: `${base}images/code-copilot-analytics.png`,
    addedOn: "2026-06-25",
    tech: ["Python", "R"],
    domain: ["Adoption & Usage", "Copilot & Agents"],
    collections: ["Analytics"],
  },
  {
    id: "frontier-analytics",
    title: "Frontier Analytics",
    description:
      "AI-assisted, export-first toolkit — ready-to-paste prompts for coding agents, schema docs for person queries & Purview audit logs, and sample specs for ROI estimation dashboards.",
    url: "https://microsoft.github.io/viva-insights-sample-code/frontier-analytics/",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: `${base}images/code-frontier-analytics.png`,
    addedOn: "2026-07-03",
    tech: ["Power BI", "AI-assisted"],
    domain: ["Impact & ROI", "Copilot & Agents", "Advanced / ML"],
    collections: ["Export"],
  },
  {
    id: "network-analysis",
    title: "Network Analysis",
    description:
      "Organisational Network Analysis (ONA) — visualise collaboration flows, identify influencers & connectors, map cross-team silos, and track M&A integration or remote-work patterns.",
    url: "https://microsoft.github.io/viva-insights-sample-code/network/",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: `${base}images/code-network-analysis.png`,
    addedOn: "2026-06-12",
    tech: ["Python", "R", "Power BI"],
    domain: ["Adoption & Usage", "Impact & ROI"],
    collections: ["Analytics"],
  },
  {
    id: "portable-audit-exporter",
    title: "Portable Audit eXporter (PAX)",
    description:
      "Export and analyze Microsoft 365 audit logs with a portable, ready-to-run toolkit for compliance and usage insights.",
    url: "https://microsoft.github.io/PAX-Cookbook/",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: addEditShareIcon,
    addedOn: "2026-06-30",
    tech: ["AI-assisted"],
    domain: ["Adoption & Usage", "Impact & ROI"],
    collections: ["Export"],
  },
];

// Technology tag filters for the home "Sample Code" section. "Featured" (default)
// shows all; mirrors the Template Library home impact chips.
export const codeHomeTechFilters = [
  "Featured",
  "Python",
  "R",
  "Power BI",
  "AI-assisted",
] as const;
export type CodeHomeTechFilter = (typeof codeHomeTechFilters)[number];

// "Technology" filter tags for the dedicated Sample Code page ("All" shows all).
export const codeTechFilters = [
  "All",
  "Python",
  "R",
  "Power BI",
  "AI-assisted",
] as const;
export type CodeTechFilter = (typeof codeTechFilters)[number];

// "Domain" filter tags for the dedicated Sample Code page ("All" shows all).
export const codeDomainFilters = [
  "All",
  "Adoption & Usage",
  "Impact & ROI",
  "Copilot & Agents",
  "Advanced / ML",
] as const;
export type CodeDomainFilter = (typeof codeDomainFilters)[number];

export const research: ResearchItem[] = [
  {
    id: "agent-assisted-hours",
    title: "Agent assisted Hours",
    description:
      "Understand agent-assisted hours — how much time agents are helping teams reclaim, with a breakdown of impact across the organization.",
    url: `${base}agent-assisted-hours.html`,
    icon: DocumentBulletList24Regular,
    kind: "Playbook",
    addedOn: "2026-07-23",
    domain: ["Business Value", "Productivity", "Agent Analytics"],
    contentType: ["Org wide", "Framework"],
  },
  {
    id: "cowork-value-methodology",
    title: "Cowork Value Estimator Methodology",
    description:
      "Explore the methodology behind the Cowork Value Estimator for measuring collaboration impact.",
    url: "/CopilotAnalyticsLabs/Cowork_Methodology.pdf",
    icon: DocumentBulletList24Regular,
    kind: "Playbook",
    addedOn: "2026-06-20",
    domain: ["Business Value", "Productivity", "AI Transformation"],
    contentType: ["Framework", "Benchmark"],
  },
  {
    id: "new-future-of-work",
    title: "The New Future of Work",
    description:
      "A research hub from Microsoft — controlled studies, real-world signals, and researcher perspectives on how AI is changing work.",
    url: "https://microsoft.github.io/nfw-reader/",
    icon: DocumentBulletList24Regular,
    kind: "Research",
    addedOn: "2026-05-15",
    domain: ["AI Transformation", "Productivity"],
    contentType: ["Industry wide"],
  },
  {
    id: "work-trend-index-2026",
    title: "Microsoft Work Trend Index Report 2026",
    description:
      "The latest annual Work Trend Index report — data-driven insights on how AI is reshaping work, productivity, and the future of organizations.",
    url: "https://assets-c4akfrf5b4d3f4b7.z01.azurefd.net/assets/2026/05/2026_Work_Trend_Index_Annual_Report_050526-7_69fc5b1c4e265.pdf",
    icon: DocumentBulletList24Regular,
    kind: "Research",
    addedOn: "2026-05-05",
    domain: ["AI Transformation", "Productivity"],
    contentType: ["Industry wide", "Benchmark"],
  },
  {
    id: "copilot-advanced-analytics",
    title: "Advanced Analysis Examples with Copilot Analytics",
    description:
      "A recipe book of analysis and visualization examples for measuring Copilot adoption and impact — built for analytics leaders and data scientists.",
    url: "https://aka.ms/CopilotAdvancedAnalytics",
    icon: DocumentBulletList24Regular,
    ctaLabel: "Download report",
    kind: "Playbook",
    addedOn: "2026-07-02",
    domain: ["Copilot Adoption", "Agent Analytics", "Business Value"],
    contentType: ["Org wide", "Framework"],
  },
  {
    id: "causal-impact-copilot-word",
    title: "How Copilot Changed the Pace of Work in Word",
    description:
      "A study of 72,000+ Word users reveals how sustained Copilot adoption changed the pace of work — and introduces a new method to measure AI impact as products and people evolve together.",
    url: "https://microsoft.github.io/nfw-reader/posts/causal-impact-copilot",
    icon: DocumentBulletList24Regular,
    kind: "Research",
    addedOn: "2026-06-28",
    domain: ["Business Value", "Productivity"],
    contentType: ["Industry wide", "Benchmark"],
  },
  {
    id: "when-ai-met-the-meeting",
    title: "When AI Met the Meeting",
    description:
      "An in-depth exploration of how AI is transforming meetings — from preparation and real-time assistance to post-meeting insights and action items.",
    url: "https://microsoft.github.io/viva-insights-sample-code/articles/when-ai-met-the-meeting/",
    icon: DocumentBulletList24Regular,
    kind: "Research",
    addedOn: "2026-07-06",
    domain: ["Productivity", "AI Transformation"],
    contentType: ["Industry wide"],
  },
];
