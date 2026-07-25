import { useEffect, useMemo, useState } from "react";
import { makeStyles, mergeClasses, shorthands } from "@fluentui/react-components";
import { ChevronLeft20Filled, DocumentBulletList24Regular, Open16Filled } from "@fluentui/react-icons";
import {
  resources,
  codeDomainFilters,
  codeTechFilters,
} from "./data";
import type { CodeDomainFilter, CodeTechFilter } from "./data";
import { logClick, logPageView, TelemetryEvents } from "./telemetry";
import { VoteBar } from "./VoteBar";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#F8F9FC",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    color: "#242424",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#335CCC",
    textDecorationLine: "none",
    cursor: "pointer",
    ...shorthands.border("none"),
    backgroundColor: "transparent",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  hero: {
    background:
      "linear-gradient(113deg, rgba(240,231,255,0.7) 0%, rgba(255,255,255,1) 45%, rgba(228,243,255,0.9) 100%)",
    ...shorthands.padding("48px", "48px", "32px"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("32px", "16px", "24px"),
    },
  },
  container: {
    width: "100%",
    maxWidth: "1024px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  breadcrumb: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    marginBottom: "0",
  },
  breadcrumbLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    color: "#335CCC",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    textDecoration: "none",
    cursor: "pointer",
    ':hover': {
      textDecoration: "underline",
    },
  },
  eyebrow: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#7A49BB",
  },
  title: {
    margin: "8px 0 0",
    fontSize: "34px",
    lineHeight: "42px",
    fontWeight: 700,
    color: "#0E1726",
    '@media (max-width: 600px)': {
      fontSize: "26px",
      lineHeight: "34px",
    },
  },
  description: {
    margin: "12px 0 0",
    fontSize: "15px",
    lineHeight: "22px",
    color: "#424242",
    maxWidth: "760px",
  },
  body: {
    flex: 1,
    ...shorthands.padding("32px", "48px", "64px"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("24px", "16px", "48px"),
    },
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: "28px",
    rowGap: "16px",
    marginBottom: "40px",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  filterDivider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#E0E0E0",
    '@media (max-width: 720px)': {
      display: "none",
    },
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#616161",
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
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: 500,
    color: "#424242",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    ...shorthands.padding("6px", "14px"),
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "#E0E0E0"),
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
  section: {
    marginBottom: "48px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    lineHeight: "28px",
    fontWeight: 700,
    color: "#0E1726",
  },
  sectionCount: {
    fontSize: "13px",
    color: "#8A8A8A",
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
    ...shorthands.borderRadius("16px"),
    ...shorthands.overflow("hidden"),
    boxSizing: "border-box",
  },
  cardImage: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    display: "block",
  },
  cardIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "160px",
    fontSize: "48px",
    color: "#7A49BB",
    background: "linear-gradient(135deg, #F5EAFE 0%, #EEF2FF 100%)",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    ...shorthands.padding("20px"),
    flex: 1,
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "24px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    ...shorthands.padding("4px", "8px"),
    ...shorthands.borderRadius("100px"),
    color: "#3B4A66",
    backgroundColor: "#EEF2FF",
  },
  tagRed: {
    color: "#B10E1C",
    backgroundColor: "#FDF3F4",
  },
  tagOrange: {
    color: "#FF5C39",
    backgroundColor: "#FFF4D8",
  },
  tagPurple: {
    color: "#881798",
    backgroundColor: "rgba(198, 177, 222, 0.2)",
  },
  tagTeal: {
    color: "#00666D",
    backgroundColor: "#E5FEFF",
  },
  cardTitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "22px",
    fontWeight: 600,
    color: "#0E1726",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardDescription: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "18px",
    color: "#616161",
    flex: 1,
  },
  cardButton: {
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
  voteBar: {
    marginTop: "12px",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "auto",
  },
  empty: {
    ...shorthands.padding("48px", "0"),
    textAlign: "center",
    fontSize: "14px",
    color: "#616161",
  },
});

export default function CodesPage() {
  const styles = useStyles();
  const [domainFilter, setDomainFilter] = useState<CodeDomainFilter>("All");
  const [techFilter, setTechFilter] = useState<CodeTechFilter>("All");

  useEffect(() => {
    logPageView();
  }, []);

  const sections = useMemo(() => {
    const filtered = resources.filter(
      (item) =>
        (domainFilter === "All" || item.domain.includes(domainFilter)) &&
        (techFilter === "All" || item.tech.includes(techFilter)),
    );

    // "New and Popular" mirrors the home page logic: most recently added first, capped.
    const newAndPopular = [...filtered]
      .sort((a, b) => (b.addedOn ?? "").localeCompare(a.addedOn ?? ""))
      .slice(0, 3);

    return [
      { key: "new", title: "New and Popular", items: newAndPopular },
      {
        key: "analytics",
        title: "Analytics",
        items: filtered.filter((item) => item.collections.includes("Analytics")),
      },
      {
        key: "export",
        title: "Export",
        items: filtered.filter((item) => item.collections.includes("Export")),
      },
    ];
  }, [domainFilter, techFilter]);

  const hasResults = sections.some((section) => section.items.length > 0);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <a className={styles.breadcrumbLink} href={`${import.meta.env.BASE_URL}#/`}>
              <ChevronLeft20Filled />
              Back to Labs
            </a>
          </nav>
          <h1 className={styles.title}>Browse all sample code</h1>
          <p className={styles.description}>
            Reusable scripts, prompt libraries, and analytical methods for Python, R, Power BI, and more. Filter
            by analysis focus and language to find the right starting point.
          </p>
        </div>
      </header>

      <main className={styles.body}>
        <div className={styles.container}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Analysis Focus</span>
              <div className={styles.chipRow} role="group" aria-label="Filter by analysis focus">
                {codeDomainFilters.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={mergeClasses(styles.chip, domainFilter === cat && styles.chipActive)}
                    aria-pressed={domainFilter === cat}
                    onClick={() => setDomainFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterDivider} aria-hidden="true" />

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Language &amp; Tool</span>
              <div className={styles.chipRow} role="group" aria-label="Filter by language and tool">
                {codeTechFilters.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={mergeClasses(styles.chip, techFilter === cat && styles.chipActive)}
                    aria-pressed={techFilter === cat}
                    onClick={() => setTechFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!hasResults ? (
            <p className={styles.empty}>No sample code matches the selected filters.</p>
          ) : (
            sections
              .filter((section) => section.items.length > 0)
              .map((section) => (
                <section key={section.key} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    <span className={styles.sectionCount}>{section.items.length}</span>
                  </div>
                  <div className={styles.grid}>
                    {section.items.map((item) => {
                      const Icon = item.icon ?? DocumentBulletList24Regular;
                      return (
                        <article key={item.id} className={styles.card}>
                          {item.image ? (
                            <img className={styles.cardImage} src={item.image} alt="" />
                          ) : (
                            <div className={styles.cardIcon}>
                              <Icon />
                            </div>
                          )}
                          <div className={styles.cardContent}>
                            <div className={styles.tagRow}>
                              {item.tech.map((tag) => (
                                <span
                                  key={tag}
                                  className={mergeClasses(
                                    styles.tag,
                                    tag === "Python" && styles.tagRed,
                                    tag === "R" && styles.tagOrange,
                                    tag === "Power BI" && styles.tagPurple,
                                    tag === "AI-assisted" && styles.tagTeal,
                                  )}
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.domain.map((tag) => (
                                <span key={tag} className={styles.tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDescription}>{item.description}</p>
                            <div className={styles.cardFooter}>
                              <a
                                className={styles.cardButton}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => logClick(TelemetryEvents.CodeViewClick, { resource: item.id })}
                              >
                                View code
                                <Open16Filled fontSize={12} />
                              </a>
                              <VoteBar cardId={item.id} variant="inline" />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
          )}
        </div>
      </main>
    </div>
  );
}
