import { useEffect, useMemo, useState } from "react";
import { makeStyles, mergeClasses, shorthands } from "@fluentui/react-components";
import { ChevronLeft20Filled, Open16Filled } from "@fluentui/react-icons";
import {
  research,
  researchDomainFilters,
  researchContentTypeFilters,
} from "./data";
import type { ResearchDomainFilter, ResearchContentTypeFilter } from "./data";
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
      "linear-gradient(96.15deg, rgba(118,79,245,0.06) 12.38%, rgba(63,108,233,0.06) 39.4%, rgba(32,187,198,0.06) 96.13%)",
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
    background: "linear-gradient(96.16deg, #E76633 -1.08%, #9D68E3 14.88%, #20BBC6 96.17%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
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
    fontSize: "11px",
    lineHeight: "16px",
    fontWeight: 600,
    ...shorthands.padding("2px", "8px"),
    ...shorthands.borderRadius("999px"),
    color: "#3B4A66",
    backgroundColor: "#EEF2FF",
  },
  tagKind: {
    color: "#7A3EA6",
    backgroundColor: "#F5EAFE",
  },
  tagContent: {
    color: "#2A7D86",
    backgroundColor: "#E8F8FA",
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

export default function ResearchPage() {
  const styles = useStyles();
  const [domainFilter, setDomainFilter] = useState<ResearchDomainFilter>("All");
  const [contentFilter, setContentFilter] = useState<ResearchContentTypeFilter>("All");

  useEffect(() => {
    logPageView();
  }, []);

  const sections = useMemo(() => {
    const filtered = research.filter(
      (item) =>
        (domainFilter === "All" || item.domain.includes(domainFilter)) &&
        (contentFilter === "All" || item.contentType.includes(contentFilter)),
    );

    // "New and Popular" mirrors the home page logic: most recently added first, capped.
    const newAndPopular = [...filtered]
      .sort((a, b) => (b.addedOn ?? "").localeCompare(a.addedOn ?? ""))
      .slice(0, 3);

    return [
      { key: "new", title: "New and Popular", items: newAndPopular },
      { key: "overall", title: "Overall", items: filtered },
    ];
  }, [domainFilter, contentFilter]);

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
          <h1 className={styles.title}>Browse all research and playbooks</h1>
          <p className={styles.description}>
            Adoption playbooks, methodology guides, benchmarks, and deployment research from real enterprise
            Copilot rollouts. Filter by domain and content type to find what you need.
          </p>
        </div>
      </header>

      <main className={styles.body}>
        <div className={styles.container}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Domain</span>
              <div className={styles.chipRow} role="group" aria-label="Filter by domain">
                {researchDomainFilters.map((cat) => (
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
              <span className={styles.filterLabel}>Content type</span>
              <div className={styles.chipRow} role="group" aria-label="Filter by content type">
                {researchContentTypeFilters.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={mergeClasses(styles.chip, contentFilter === cat && styles.chipActive)}
                    aria-pressed={contentFilter === cat}
                    onClick={() => setContentFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!hasResults ? (
            <p className={styles.empty}>No research or playbooks match the selected filters.</p>
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
                    {section.items.map((item) => (
                      <article key={`${section.key}-${item.id}`} className={styles.card}>
                        <div className={styles.cardContent}>
                          <div className={styles.tagRow}>
                            <span className={mergeClasses(styles.tag, styles.tagKind)}>{item.kind}</span>
                            {item.domain.map((tag) => (
                              <span key={tag} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                            {item.contentType.map((tag) => (
                              <span key={tag} className={mergeClasses(styles.tag, styles.tagContent)}>
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
                              onClick={() => logClick(TelemetryEvents.ResearchViewClick, { research: item.id })}
                            >
                              {item.kind === "Playbook" ? "View playbook" : "View report"}
                              <Open16Filled fontSize={12} />
                            </a>
                            <VoteBar cardId={item.id} variant="inline" />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
          )}
        </div>
      </main>
    </div>
  );
}
