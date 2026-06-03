import {
  BoardSplit24Regular,
  DataTrending24Regular,
  Sparkle24Regular,
  DocumentBulletList24Regular,
  PersonBoard24Regular,
  PeopleStar24Regular,
} from "@fluentui/react-icons";

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType;
  image?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType;
  category: "Code" | "Prompts";
  image?: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType;
}

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
  },
  {
    id: "github-copilot-impact-org",
    title: "GitHub Copilot Impact Report (Org Level)",
    description:
      "Org-wide GitHub Copilot usage and productivity impact analysis with seat utilization and code completion metrics.",
    url: "https://github.com/microsoft/GitHubCopilotImpact#-github-copilot-impact",
    icon: DataTrending24Regular,
    image: `${base}images/card-github-copilot-org.png`,
  },
  {
    id: "ai-business-value",
    title: "AI Business Value Dashboard",
    description:
      "Quantify business value of AI adoption across your organization with executive-ready visualizations.",
    url: "https://github.com/Keithland89/AI-Business-Value-Dashboard#-ai-business-value-dashboard",
    icon: Sparkle24Regular,
    image: `${base}images/card-ai-business-value.png`,
  },
  {
    id: "github-copilot-impact-personal",
    title: "GitHub Copilot Impact (Personal)",
    description:
      "Your personal impact report — what you built, the skills augmented, and the ROI delivered with GitHub Copilot.",
    url: "https://github.com/microsoft/What-I-Did-Copilot#what-i-did--github-copilot-impact-report",
    icon: PersonBoard24Regular,
    image: `${base}images/card-github-copilot-personal.png`,
  },
  {
    id: "m365-copilot-personal",
    title: "Microsoft 365 Copilot Personal Insights",
    description:
      "Personal adoption and engagement dashboard tracking your Microsoft 365 Copilot usage journey and productivity gains.",
    url: "https://github.com/sbrandl1005/copilot-personal-dashboard#whats-in-this-report",
    icon: PersonBoard24Regular,
    image: `${base}images/card-m365-copilot-personal.png`,
  },
  {
    id: "superuser-impact",
    title: "SuperUser Impact Report",
    description:
      "Analyze the work and productivity impact of superusers across your organization with detailed pattern analysis.",
    url: "https://github.com/microsoft/superuserimpact#superuser-impact-report",
    icon: PeopleStar24Regular,
    image: `${base}images/card-superuser-impact.png`,
  },
];

export const resources: ResourceItem[] = [
  {
    id: "viva-insights-essentials",
    title: "Viva Insights Analysis - Essentials",
    description:
      "Get started with R & Python utility scripts — exploratory data analysis, standard visualisations (bar charts, trend lines, network diagrams), and custom KPI generation from Viva Insights data.",
    url: "https://microsoft.github.io/viva-insights-sample-code/essentials/",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: `${base}images/code-essentials.png`,
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
  },
  {
    id: "portable-audit-exporter",
    title: "Portable Audit Exporter",
    description:
      "Export and analyze Microsoft 365 audit logs with a portable, ready-to-run toolkit for compliance and usage insights.",
    url: "https://github.com/microsoft/pax",
    icon: DocumentBulletList24Regular,
    category: "Code",
    image: `${base}images/code-portable-audit-exporter.png`,
  },
];

export const research: ResearchItem[] = [
  {
    id: "adoption-playbook",
    title: "Customer Adoption Playbook",
    description:
      "Microsoft Viva Insights adoption guide with best practices for rolling out analytics across your organization.",
    url: "https://adoption.microsoft.com/en-us/viva/insights/",
    icon: DocumentBulletList24Regular,
  },
  {
    id: "agent-assisted-hours",
    title: "Agent Assisted Hours Calculation",
    description:
      "Learn how to calculate conversational agent impact using Copilot Studio agents within Viva Insights.",
    url: "https://learn.microsoft.com/en-us/viva/insights/advanced/analyst/templates/copilot-studio-agents#conversational-agent-impact",
    icon: DocumentBulletList24Regular,
  },
  {
    id: "work-trend-index-2026",
    title: "Microsoft Work Trend Index Report 2026",
    description:
      "The latest annual Work Trend Index report — data-driven insights on how AI is reshaping work, productivity, and the future of organizations.",
    url: "https://assets-c4akfrf5b4d3f4b7.z01.azurefd.net/assets/2026/05/2026_Work_Trend_Index_Annual_Report_050526-7_69fc5b1c4e265.pdf",
    icon: DocumentBulletList24Regular,
  },
  {
    id: "copilot-advanced-analytics",
    title: "Advanced Analysis Examples with Copilot Analytics",
    description:
      "A recipe book of analysis and visualisation examples for measuring Copilot adoption and impact — built for analytics leaders and data scientists.",
    url: "https://aka.ms/CopilotAdvancedAnalytics",
    icon: DocumentBulletList24Regular,
  },
  {
    id: "getting-started-custom-analysis",
    title: "Getting Started with Custom Analysis in Copilot Analytics",
    description:
      "A tactical playbook for custom analysis — from planning your measurement programme and setting up Viva Insights to running queries and building an analysis playbook.",
    url: "https://adoption.microsoft.com/files/copilot/GettingStartedWithCustomAnalysisInCopilotAnalytics.pptx",
    icon: DocumentBulletList24Regular,
  },
  {
    id: "when-ai-met-the-meeting",
    title: "When AI Met the Meeting",
    description:
      "An in-depth exploration of how AI is transforming meetings — from preparation and real-time assistance to post-meeting insights and action items.",
    url: "https://microsoft.github.io/viva-insights-sample-code/articles/when-ai-met-the-meeting/",
    icon: DocumentBulletList24Regular,
  },
];
