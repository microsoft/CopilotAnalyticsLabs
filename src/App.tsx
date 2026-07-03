import { useEffect, useMemo, useState } from "react";
import { makeStyles, mergeClasses, shorthands } from "@fluentui/react-components";
import {
  ChevronDown16Regular,
  DocumentBulletList24Regular,
  Eye16Regular,
  PersonFeedback20Regular,
  Star16Filled,
} from "@fluentui/react-icons";
import heroIconDataTrending from "./assets/hero-icon-data-trending.svg";
import heroIconPersonData from "./assets/hero-icon-person-data.svg";
import heroIconDataBar from "./assets/hero-icon-data-bar.svg";
import sampleCodeBg from "./assets/sample-code-bg.svg";
import heroBg from "./assets/bg-group.svg";
import { research, resources, templates } from "./data";
import { logClick, logPageView, TelemetryEvents } from "./telemetry";

const VIVA_INSIGHTS_URL = "https://analysis.insights.cloud.microsoft/";
const WHATS_COMING_URL = "https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=Microsoft%20Viva";
const FEEDBACK_URL = "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UNTg1QzM4UUs1SzNFM08yUFhVTlJDSDlWUC4u";
const TERMS_URL = "https://www.microsoft.com/en-us/legal/terms-of-use";
const PRIVACY_URL = "https://privacy.microsoft.com/en-us/privacystatement";


const sectionTabs = [
  { id: "templates", label: "Templates" },
  { id: "sample-code", label: "Sample Code" },
  { id: "research", label: "Research" },
] as const;

const heroValues = [
  {
    title: "Pick a template, build a dashboard",
    description:
      "Templates, guided setup, and connectors to quickly turn ideas into dashboards.",
    icon: heroIconDataTrending,
    alt: "",
  },
  {
    title: "Real code, ready for data",
    description:
      "Ready-to-run sample code, prompts, and a toolkit for your environment.",
    icon: heroIconPersonData,
    alt: "",
  },
  {
    title: "Proven playbooks from real deployments",
    description:
      "Adoption playbooks and research based on enterprise rollouts.",
    icon: heroIconDataBar,
    alt: "",
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
  "cowork-value-methodology",
  "causal-impact-copilot-word",
  "work-trend-index-2026",
  "new-future-of-work",
  "copilot-advanced-analytics",
  "when-ai-met-the-meeting",
];

const researchTags: Record<string, { text: string; tone: string }[]> = {
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


const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    color: "#242424",
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif',
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    backgroundColor: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.padding("24px"),
    boxSizing: "border-box",
    overflow: "hidden",
    '@media (max-width: 600px)': {
      ...shorthands.padding("16px"),
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
  valueIcon: {
    width: "64px",
    height: "64px",
    objectFit: "contain",
    display: "block",
    '@media (max-width: 600px)': {
      width: "56px",
      height: "56px",
    },
  },
  valueTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#000000",
    whiteSpace: "normal",
    '@media (max-width: 600px)': {
      fontSize: "14px",
      lineHeight: "20px",
    },
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
    backgroundColor: "#FFFFFF",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  sectionResearchBg: {
    background:
      "linear-gradient(90deg, #F0F0E9 0%, #FFFDF0 100%)",
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

function MicrosoftLogoWordmark() {
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
  const [activeTab, setActiveTab] = useState<(typeof sectionTabs)[number]["id"]>("templates");
  const [ghStats, setGhStats] = useState<{ stars: string; forks: string; watchers: string }>({ stars: "—", forks: "—", watchers: "—" });
  const [showContactDialog, setShowContactDialog] = useState(false);

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

  const orderedResearch = useMemo(() => {
    const map = new Map(research.map((item) => [item.id, item]));
    return researchOrder.map((id) => map.get(id)).filter(Boolean) as typeof research;
  }, []);

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
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <MicrosoftLogoWordmark />
          <div className={styles.separator} />
          <span className={styles.brandTitle}>Copilot Analytics Labs</span>
        </div>

        <div className={styles.navLinks}>
          <a className={styles.navLink} href={VIVA_INSIGHTS_URL} target="_blank" rel="noreferrer">
            <img src={`${import.meta.env.BASE_URL}images/VI.svg`} alt="" width="20" height="20" aria-hidden="true" />
            <span>Viva Insights</span>
          </a>
          <a className={styles.navLink} href={WHATS_COMING_URL} target="_blank" rel="noreferrer">
            <span>Viva Roadmap</span>
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
              Guided templates, sample code, and playbooks grounded in real customer deployments to help you design and deploy analytics beyond what's available in Viva Insights today.
            </p>
          </div>

          <div className={styles.valuesShell}>
            <div className={styles.valuesPanel}>
              <div className={styles.valuesGrid}>
                {heroValues.map(({ title, description, icon, alt }) => (
                  <div key={title} className={styles.valueCard}>
                    <img src={icon} alt={alt} className={styles.valueIcon} aria-hidden="true" />
                    <h2 className={styles.valueTitle}>{title}</h2>
                    <p className={styles.valueDescription}>{description}</p>
                  </div>
                ))}
              </div>

              <button className={styles.primaryButton} type="button" onClick={() => { logClick(TelemetryEvents.HeroExploreClick); scrollToSection("templates"); }}>
                Explore labs
                <ChevronDown16Regular fontSize={14} />
              </button>
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

      <section id="templates" className={mergeClasses(styles.section, styles.sectionTemplateBg)}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTitleArea}>
            <p className={styles.eyebrow}>Template library</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>Pick a template, build a dashboard</h2>
            </div>
            <p className={styles.sectionDescription}>
              Production-ready dashboard templates for adoption, usage, impact, and business value that combine Viva Insights data with broader organizational signals.
            </p>
          </div>

          <div className={styles.templateGrid}>
            {orderedTemplates.map((item) => {
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
        </div>
      </section>

      <section id="sample-code" className={mergeClasses(styles.section, styles.sectionCodeBg)} style={{ backgroundImage: `url("${sampleCodeBg}")` }}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTitleArea}>
            <p className={mergeClasses(styles.eyebrow, styles.eyebrowWarm)}>Sample code</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>Grab the code, make it yours</h2>
            </div>
            <p className={styles.sectionDescription}>
              Reusable scripts, prompt libraries, and analytical methods for Python, R, and Power BI that you can adapt to your organization's data.
            </p>
          </div>

          <div className={styles.codeGrid}>
            {resources.map((item) => {
              const Icon = item.icon ?? DocumentBulletList24Regular;
              const meta = resourceMeta[item.id];
              const isFeatured = Boolean(meta?.featured);

              return (
                <article key={item.id} className={mergeClasses(styles.codeCard, isFeatured && styles.codeCardFeatured)}>
                  <div
                    className={mergeClasses(styles.codeArt, isFeatured && styles.codeArtFeatured)}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
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
                      <a className={styles.secondaryButton} href={item.url} target="_blank" rel="noreferrer" aria-label={`View code: ${item.title}`} onClick={() => logClick(TelemetryEvents.CodeViewClick, { resource: item.id })}>
                        View code
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="research" className={mergeClasses(styles.section, styles.sectionResearchBg)}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTitleArea}>
            <p className={mergeClasses(styles.eyebrow, styles.eyebrowWarm)}>Research and playbooks</p>
            <div className={styles.sectionHeadingRow}>
              <h2 className={styles.sectionHeading}>Strategies already in play</h2>
            </div>
            <p className={styles.sectionDescription}>
              Adoption playbooks, analytical methods, and deployment research inspired by real enterprise Copilot rollouts.
            </p>
          </div>

          <div className={styles.researchGrid}>
            {orderedResearch.map((item) => (
              <article key={item.id} className={styles.researchCard}>
                <div className={styles.badgeRow}>
                  {(researchTags[item.id] ?? []).map((tag) => (
                    <span
                      key={tag.text}
                      className={mergeClasses(
                        styles.tag,
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
                <div className={styles.templateCardContent} style={{ flex: 1 }}>
                  <h3 className={styles.researchTitle}>{item.title}</h3>
                  <p className={styles.researchDescription}>{item.description}</p>
                </div>
                <a className={styles.secondaryButton} href={item.url} target="_blank" rel="noreferrer" aria-label={`${item.ctaLabel ?? "View report"}: ${item.title}`} style={{ marginTop: "auto" }} onClick={() => logClick(TelemetryEvents.ResearchViewClick, { research: item.id })}>
                  {item.ctaLabel ?? "View report"}
                </a>
              </article>
            ))}
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
