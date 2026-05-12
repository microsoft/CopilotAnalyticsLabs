import { useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  makeStyles,
  shorthands,
  tokens,
  Text,
} from "@fluentui/react-components";
import {
  Beaker24Regular,
  ArrowRight16Regular,
  Open16Regular,
  Library24Regular,
  BookOpenGlobe24Regular,
  Code24Regular,
  DocumentBulletList24Regular,
  Chat24Regular,
  LearningApp24Regular,
  Dismiss24Regular,
  Mail24Regular,
} from "@fluentui/react-icons";
import { templates, resources } from "./data";

/* ─── Viva-inspired palette ─── */
const viva = {
  purple: "#6264A7",
  purpleDark: "#464775",
  purpleDeep: "#33344A",
  blue: "#0078D4",
  teal: "#008272",
  amber: "#CA5010",
  heroGradient:
    "linear-gradient(135deg, #1B1050 0%, #33344A 30%, #464775 60%, #6264A7 100%)",
  sectionGradient:
    "linear-gradient(135deg, #f0eef8 0%, #e8eaf6 50%, #e3f2fd 100%)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.08)",
  cardShadowHover: "0 8px 24px rgba(0,0,0,0.14)",
};

const VIVA_INSIGHTS_URL = "https://df.analysis.insights.cloud.microsoft/";

const categoryColors: Record<string, { bg: string; fg: string }> = {
  Guidance: { bg: "#e0f2f1", fg: "#008272" },
  Code: { bg: "#e3f2fd", fg: "#0078D4" },
  Prompts: { bg: "#f3e5f5", fg: "#8764B8" },
};

const resourceIcons: Record<string, React.ComponentType> = {
  Guidance: BookOpenGlobe24Regular,
  Code: Code24Regular,
  Prompts: Chat24Regular,
  Docs: LearningApp24Regular,
};

const useStyles = makeStyles({
  /* ─── Page shell ─── */
  page: {
    minHeight: "100vh",
    backgroundColor: "#faf9f8",
  },

  /* ─── Nav bar ─── */
  nav: {
    display: "flex",
    alignItems: "center",
    ...shorthands.padding("12px", "40px"),
    backgroundColor: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    position: "sticky" as const,
    top: "0",
    zIndex: 100,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
    fontSize: "16px",
    fontWeight: 600,
    color: viva.purpleDark,
  },
  navLinks: {
    display: "flex",
    ...shorthands.gap("24px"),
    marginLeft: "auto",
    alignItems: "center",
  },
  navLink: {
    fontSize: "14px",
    fontWeight: 500,
    color: tokens.colorNeutralForeground2,
    cursor: "pointer",
    transitionProperty: "color",
    transitionDuration: "0.2s",
    ":hover": {
      color: viva.purple,
    },
  },
  navDivider: {
    width: "1px",
    height: "20px",
    backgroundColor: tokens.colorNeutralStroke2,
  },

  /* ─── Hero ─── */
  hero: {
    background: viva.heroGradient,
    ...shorthands.padding("64px", "40px", "56px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "100%",
    ...shorthands.gap("48px"),
    "@media (max-width: 900px)": {
      flexDirection: "column" as const,
      textAlign: "center" as const,
      ...shorthands.padding("48px", "24px", "40px"),
    },
  },
  heroText: {
    maxWidth: "620px",
    display: "flex",
    flexDirection: "column" as const,
    ...shorthands.gap("14px"),
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
    backgroundColor: "rgba(255,255,255,0.12)",
    ...shorthands.borderRadius("20px"),
    ...shorthands.padding("6px", "14px"),
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.85)",
    width: "fit-content",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  heroTitle: {
    fontSize: "40px",
    fontWeight: 700,
    lineHeight: "1.15",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  heroSubtitle: {
    fontSize: "16px",
    lineHeight: "1.65",
    color: "rgba(255,255,255,0.85)",
    maxWidth: "560px",
  },
  heroActions: {
    display: "flex",
    ...shorthands.gap("12px"),
    marginTop: "4px",
    "@media (max-width: 900px)": {
      justifyContent: "center",
    },
  },
  heroImageCard: {
    flexShrink: 0,
    width: "440px",
    ...shorthands.borderRadius("12px"),
    ...shorthands.overflow("hidden"),
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    backgroundColor: "#1a1a2e",
    "@media (max-width: 900px)": {
      width: "100%",
      maxWidth: "440px",
    },
  },
  heroImage: {
    width: "100%",
    display: "block",
  },

  /* ─── Sections ─── */
  section: {
    maxWidth: "1200px",
    marginLeft: "auto",
    marginRight: "auto",
    ...shorthands.padding("48px", "40px"),
    "@media (max-width: 600px)": {
      ...shorthands.padding("36px", "20px"),
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
    marginBottom: "8px",
  },
  sectionIcon: {
    color: viva.purple,
    fontSize: "24px",
  },
  sectionTitle: {
    fontSize: "26px",
    fontWeight: 700,
    color: viva.purpleDeep,
  },
  sectionDesc: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: viva.purpleDark,
    marginBottom: "24px",
    maxWidth: "720px",
    ...shorthands.padding("10px", "16px"),
    backgroundColor: "rgba(98,100,167,0.05)",
    borderLeft: `3px solid ${viva.purple}`,
    ...shorthands.borderRadius("0", "8px", "8px", "0"),
  },

  /* ─── Template cards — horizontal layout ─── */
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    ...shorthands.gap("16px"),
    "@media (max-width: 800px)": {
      gridTemplateColumns: "1fr",
    },
  },
  templateCard: {
    backgroundColor: "#fff",
    ...shorthands.borderRadius("10px"),
    ...shorthands.overflow("hidden"),
    boxShadow: viva.cardShadow,
    transitionProperty: "transform, box-shadow",
    transitionDuration: "0.25s",
    transitionTimingFunction: "ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "stretch",
    ":hover": {
      transform: "translateY(-3px)",
      boxShadow: viva.cardShadowHover,
    },
  },
  templateBody: {
    ...shorthands.padding("14px", "16px"),
    display: "flex",
    flexDirection: "column" as const,
    flexGrow: 1,
    justifyContent: "center",
    ...shorthands.gap("4px"),
    minWidth: 0,
  },
  templateImageWrapper: {
    flexShrink: 0,
    width: "150px",
    ...shorthands.overflow("hidden"),
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
  },
  templateImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  templateIconFallback: {
    flexShrink: 0,
    width: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    backgroundColor: "#ede7f6",
    color: viva.purple,
  },
  templateTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: viva.purpleDeep,
    lineHeight: "1.35",
  },
  templateDesc: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: tokens.colorNeutralForeground2,
    flexGrow: 1,
  },
  templateCta: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    fontSize: "12px",
    fontWeight: 600,
    color: viva.purple,
    marginTop: "4px",
  },

  /* ─── Resources ─── */
  resourcesBg: {
    background: viva.sectionGradient,
  },
  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    ...shorthands.gap("16px"),
    "@media (max-width: 900px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
  },
  resourceCard: {
    backgroundColor: "#fff",
    ...shorthands.borderRadius("10px"),
    ...shorthands.padding("18px"),
    boxShadow: viva.cardShadow,
    display: "flex",
    flexDirection: "column" as const,
    ...shorthands.gap("10px"),
    transitionProperty: "transform, box-shadow",
    transitionDuration: "0.25s",
    cursor: "pointer",
    ":hover": {
      transform: "translateY(-3px)",
      boxShadow: viva.cardShadowHover,
    },
  },
  resourceCardTop: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
  },
  resourceIconCircle: {
    flexShrink: 0,
    width: "36px",
    height: "36px",
    ...shorthands.borderRadius("8px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  resourceCategory: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
    ...shorthands.borderRadius("4px"),
    ...shorthands.padding("2px", "8px"),
  },
  resourceTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: viva.purpleDeep,
    lineHeight: "1.3",
  },
  resourceDesc: {
    fontSize: "12px",
    lineHeight: "1.5",
    color: tokens.colorNeutralForeground2,
  },

  /* ─── Contact dialog ─── */
  contactBody: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    ...shorthands.gap("16px"),
    ...shorthands.padding("24px", "0"),
    textAlign: "center" as const,
  },
  contactIconCircle: {
    width: "56px",
    height: "56px",
    ...shorthands.borderRadius("50%"),
    backgroundColor: "rgba(98,100,167,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: viva.purple,
    fontSize: "28px",
  },
  contactEmail: {
    fontSize: "16px",
    fontWeight: 600,
    color: viva.purple,
  },

  /* ─── Footer ─── */
  footer: {
    textAlign: "center" as const,
    ...shorthands.padding("28px", "40px"),
    backgroundColor: viva.purpleDeep,
    color: "rgba(255,255,255,0.6)",
    fontSize: "13px",
  },
});

function App() {
  const styles = useStyles();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className={styles.page}>
      {/* ─── Sticky nav ─── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          {/* Microsoft logo */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23">
            <rect x="0" y="0" width="11" height="11" fill="#f25022" />
            <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
            <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
            <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
          </svg>
          <Beaker24Regular />
          Copilot Analytics Labs
        </div>
        <div className={styles.navLinks}>
          <a
            className={styles.navLink}
            href="#templates"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("templates")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Templates
          </a>
          <a
            className={styles.navLink}
            href="#resources"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("resources")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Resources
          </a>
          <a
            className={styles.navLink}
            href={VIVA_INSIGHTS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Viva Insights
          </a>
          <div className={styles.navDivider} />
          <a
            className={styles.navLink}
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              setContactOpen(true);
            }}
          >
            Contact Us
          </a>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.heroBadge}>
            <Beaker24Regular style={{ fontSize: 14 }} />
            Microsoft Copilot Analytics Lab
          </div>
          <h1 className={styles.heroTitle}>
            Copilot Analytics Labs
          </h1>
          <Text className={styles.heroSubtitle}>
            Explore ready-made dashboards, reports, and code to quantify
            Microsoft Copilot and Agent ROI. Test and validate advanced Copilot
            analytics using real-world templates, prompts, and customer
            insights—before scaling to production.
          </Text>
          <div className={styles.heroActions}>
            <Button
              appearance="primary"
              icon={<Open16Regular />}
              iconPosition="after"
              style={{ backgroundColor: viva.purple, borderColor: viva.purple }}
              onClick={() =>
                document
                  .getElementById("templates")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Templates
            </Button>
            <Button
              appearance="outline"
              icon={<Library24Regular />}
              style={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.4)",
              }}
              onClick={() =>
                document
                  .getElementById("resources")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Resources Library
            </Button>
          </div>
        </div>
        <div className={styles.heroImageCard}>
          <img
            className={styles.heroImage}
            src="/images/aio-dashboard.png"
            alt="All in One Dashboard preview"
          />
        </div>
      </section>

      {/* ─── Explore Templates ─── */}
      <div id="templates" className={styles.section}>
        <div className={styles.sectionHeader}>
          <Beaker24Regular className={styles.sectionIcon} />
          <Text className={styles.sectionTitle}>Explore Templates</Text>
        </div>
        <Text className={styles.sectionDesc}>
          Ready-made dashboards and reports to measure Copilot adoption,
          productivity impact, and business value — deploy in minutes.
        </Text>
        <div className={styles.templateGrid}>
          {templates.map((t) => {
            const Icon = t.icon;
            return (
              <a
                key={t.id}
                className={styles.templateCard}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={styles.templateBody}>
                  <Text className={styles.templateTitle}>{t.title}</Text>
                  <Text className={styles.templateDesc}>{t.description}</Text>
                  <div className={styles.templateCta}>
                    <span>Open template</span>
                    <ArrowRight16Regular />
                  </div>
                </div>
                {t.image ? (
                  <div className={styles.templateImageWrapper}>
                    <img
                      className={styles.templateImage}
                      src={t.image}
                      alt=""
                    />
                  </div>
                ) : (
                  <div className={styles.templateIconFallback}>
                    <Icon />
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* ─── Resources Library ─── */}
      <div id="resources" className={styles.resourcesBg}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Library24Regular className={styles.sectionIcon} />
            <Text className={styles.sectionTitle}>Resources Library</Text>
          </div>
          <Text className={styles.sectionDesc}>
            Guides, sample code, prompt libraries, and toolkits to deepen your
            Copilot analytics practice.
          </Text>
          <div className={styles.resourceGrid}>
            {resources.map((r) => {
              const Icon =
                resourceIcons[r.category] ?? DocumentBulletList24Regular;
              const colors = categoryColors[r.category] ?? {
                bg: "#ede7f6",
                fg: "#6264A7",
              };
              return (
                <a
                  key={r.id}
                  className={styles.resourceCard}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.resourceCardTop}>
                    <div
                      className={styles.resourceIconCircle}
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.fg,
                      }}
                    >
                      <Icon />
                    </div>
                    <span
                      className={styles.resourceCategory}
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.fg,
                      }}
                    >
                      {r.category}
                    </span>
                  </div>
                  <Text className={styles.resourceTitle}>{r.title}</Text>
                  <Text className={styles.resourceDesc}>{r.description}</Text>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className={styles.footer}>
        Copilot Analytics Labs — Templates &amp; resources for Microsoft Copilot
        analytics. Not officially supported. Use at your own discretion.
      </footer>

      {/* ─── Contact Us Dialog ─── */}
      <Dialog open={contactOpen} onOpenChange={(_e, data) => setContactOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle
              action={
                <DialogTrigger action="close">
                  <Button
                    appearance="subtle"
                    aria-label="Close"
                    icon={<Dismiss24Regular />}
                  />
                </DialogTrigger>
              }
            >
              Contact Us
            </DialogTitle>
            <DialogContent>
              <div className={styles.contactBody}>
                <div className={styles.contactIconCircle}>
                  <Mail24Regular />
                </div>
                <Text style={{ fontSize: "15px", lineHeight: "1.6" }}>
                  For any queries, questions, or feedback about Copilot
                  Analytics Labs, please reach out to our team:
                </Text>
                <a
                  className={styles.contactEmail}
                  href="mailto:copilot@microsoft.com"
                >
                  copilot@microsoft.com
                </a>
              </div>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

export default App;
