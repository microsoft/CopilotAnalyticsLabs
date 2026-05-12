import {
  BoardSplit24Regular,
  DataTrending24Regular,
  Sparkle24Regular,
  DocumentBulletList24Regular,
  PersonBoard24Regular,
  AppGeneric24Regular,
  ClipboardTextLtr24Regular,
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
  category: "Guidance" | "Code" | "Prompts";
}

export const templates: TemplateItem[] = [
  {
    id: "aio-dashboard",
    title: "All in One Dashboard",
    description:
      "Comprehensive Copilot analytics covering adoption, usage, impact, and ROI — all in a single Power BI dashboard.",
    url: "https://github.com/microsoft/AI-in-One-Dashboard",
    icon: BoardSplit24Regular,
    image: "/images/aio-dashboard.png",
  },
  {
    id: "github-copilot-impact-org",
    title: "GitHub Copilot Impact Report (Org Level)",
    description:
      "Org-wide GitHub Copilot usage and productivity impact analysis with seat utilization and code completion metrics.",
    url: "https://github.com/microsoft/GitHubCopilotImpact",
    icon: DataTrending24Regular,
    image: "/images/github-copilot-impact.png",
  },
  {
    id: "ai-business-value",
    title: "AI Business Value Dashboard",
    description:
      "Quantify business value of AI adoption across your organization with executive-ready visualizations.",
    url: "https://github.com/Keithland89/AI-Business-Value-Dashboard",
    icon: Sparkle24Regular,
    image: "/images/ai-business-value.png",
  },
  {
    id: "github-copilot-impact-personal",
    title: "GitHub Copilot Impact (Personal)",
    description:
      "Your personal impact report — what you built, the skills augmented, and the ROI delivered with GitHub Copilot.",
    url: "https://github.com/microsoft/What-I-Did-Copilot",
    icon: PersonBoard24Regular,
    image: "/images/what-i-did-copilot.png",
  },
  {
    id: "m365-copilot-personal",
    title: "M365 Copilot Personal Insights",
    description:
      "Personal adoption and engagement dashboard tracking your M365 Copilot usage journey and productivity gains.",
    url: "https://github.com/sbrandl1005/copilot-personal-dashboard",
    icon: PersonBoard24Regular,
    image: "/images/copilot-personal-dashboard.png",
  },
  {
    id: "m365-app-usage",
    title: "M365 App Usage Analytics",
    description:
      "Power BI template for M365 app usage analytics and Copilot license recommendations across your tenant.",
    url: "https://github.com/microsoft/M365UsageAnalytics",
    icon: AppGeneric24Regular,
    image: "/images/m365-usage-analytics.png",
  },
  {
    id: "executive-summary",
    title: "Executive Summary",
    description:
      "Prompt-powered executive summary for Viva Insights data — concise narratives from complex workplace analytics.",
    url: "https://github.com/nickyoung-github/Viva-Insights-Sample-Code-Library",
    icon: ClipboardTextLtr24Regular,
  },
  {
    id: "superuser-impact",
    title: "SuperUser Impact Report",
    description:
      "Analyze the work and productivity impact of superusers across your organization with detailed pattern analysis.",
    url: "https://github.com/microsoft/superuserimpact",
    icon: PeopleStar24Regular,
    image: "/images/superuser-impact.png",
  },
];

export const resources: ResourceItem[] = [
  {
    id: "adoption-playbook",
    title: "Customer Adoption Playbook",
    description:
      "Microsoft Viva Insights adoption guide with best practices for rolling out analytics across your organization.",
    url: "https://adoption.microsoft.com/en-us/viva/insights/",
    icon: DocumentBulletList24Regular,
    category: "Guidance",
  },
  {
    id: "sample-code-r",
    title: "Copilot Analytics Sample Code (R)",
    description:
      "R examples for querying and analyzing Copilot analytics data using the Viva Insights R library.",
    url: "https://github.com/microsoft/viva-insights-sample-code/blob/main/examples/utility-r/copilot-analytics-examples.R",
    icon: DocumentBulletList24Regular,
    category: "Code",
  },
  {
    id: "sample-code-python",
    title: "Copilot Analytics Sample Code (Python)",
    description:
      "Python examples for querying and analyzing Copilot analytics data using the Viva Insights Python library.",
    url: "https://github.com/microsoft/viva-insights-sample-code",
    icon: DocumentBulletList24Regular,
    category: "Code",
  },
  {
    id: "sample-code-library",
    title: "Viva Insights Sample Code Library",
    description:
      "Complete collection of sample code for the Viva Insights R and Python libraries.",
    url: "https://github.com/microsoft/viva-insights-sample-code",
    icon: DocumentBulletList24Regular,
    category: "Code",
  },
  {
    id: "analytics-starter-kit",
    title: "Analytics Starter Kit",
    description:
      "Frontier analytics starter kit with ready-to-use queries, prompts, and visualization templates.",
    url: "https://github.com/microsoft/viva-insights-sample-code/tree/main/frontier-analytics",
    icon: DocumentBulletList24Regular,
    category: "Code",
  },
  {
    id: "prompt-libraries",
    title: "Prompt Libraries",
    description:
      "Curated prompt collection for frontier analytics — ready-to-use prompts for Copilot and Viva Insights analysis.",
    url: "https://github.com/microsoft/viva-insights-sample-code/tree/main/frontier-analytics/prompts",
    icon: DocumentBulletList24Regular,
    category: "Prompts",
  },
  {
    id: "agent-assisted-hours",
    title: "Agent Assisted Hours Calculation",
    description:
      "Learn how to calculate conversational agent impact using Copilot Studio agents within Viva Insights.",
    url: "https://learn.microsoft.com/en-us/viva/insights/advanced/analyst/templates/copilot-studio-agents#conversational-agent-impact",
    icon: DocumentBulletList24Regular,
    category: "Guidance",
  },
];
