import { useState } from "react";
import { makeStyles, mergeClasses, shorthands } from "@fluentui/react-components";
import { ChevronLeft20Filled, Copy16Regular } from "@fluentui/react-icons";
import updatesData from "../updates.json";

type UpdateTag = "Added" | "Changed" | "Fixed";

interface UpdateItem {
  id: string;
  date: string;
  tool: string;
  link: string;
  tags: UpdateTag[];
  title: string;
  summary: string;
}

const updates = [...(updatesData.updates as UpdateItem[])].sort((a, b) => b.date.localeCompare(a.date));
const feedUrl = new URL("feed.xml", updatesData.site.base).href;

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8F9FC",
    color: "#242424",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
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
    maxWidth: "860px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  breadcrumb: {
    marginBottom: "8px",
  },
  breadcrumbLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    color: "#335CCC",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    textDecorationLine: "none",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  title: {
    margin: 0,
    color: "#0E1726",
    fontSize: "34px",
    lineHeight: "42px",
    fontWeight: 700,
    '@media (max-width: 600px)': {
      fontSize: "26px",
      lineHeight: "34px",
    },
  },
  description: {
    maxWidth: "760px",
    margin: "12px 0 0",
    color: "#424242",
    fontSize: "15px",
    lineHeight: "24px",
  },
  body: {
    ...shorthands.padding("32px", "48px", "64px"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("24px", "16px", "48px"),
    },
  },
  subscribe: {
    marginBottom: "40px",
    backgroundColor: "#F1F7FF",
    borderLeft: "4px solid #335CCC",
    ...shorthands.borderRadius("0", "12px", "12px", "0"),
    ...shorthands.padding("20px", "24px"),
  },
  subscribeTitle: {
    margin: "0 0 8px",
    color: "#0E1726",
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: 700,
  },
  subscribeText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "22px",
  },
  feedRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },
  feedLink: {
    color: "#335CCC",
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: "13px",
    lineHeight: "20px",
    overflowWrap: "anywhere",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  copyButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    color: "#335CCC",
    backgroundColor: "#ffffff",
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: 600,
    ...shorthands.padding("6px", "12px"),
    ...shorthands.border("1px", "solid", "#A7B5E8"),
    ...shorthands.borderRadius("6px"),
    ':hover': {
      backgroundColor: "#E8EFFF",
    },
  },
  copiedButton: {
    color: "#0E700E",
    ...shorthands.borderColor("#9AD29A"),
    backgroundColor: "#F1FAF1",
  },
  howToTitle: {
    margin: "20px 0 8px",
    color: "#242424",
    fontSize: "15px",
    lineHeight: "22px",
    fontWeight: 700,
  },
  howToList: {
    margin: 0,
    paddingLeft: "22px",
    fontSize: "14px",
    lineHeight: "22px",
  },
  howToItem: {
    marginBottom: "8px",
  },
  inlineLink: {
    color: "#335CCC",
    textDecorationLine: "underline",
  },
  update: {
    borderTop: "1px solid #E0E0E0",
    ...shorthands.padding("28px", "0", "8px"),
  },
  meta: {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: "8px 12px",
    color: "#616161",
    fontSize: "13px",
    lineHeight: "18px",
  },
  tool: {
    fontWeight: 600,
  },
  updateTitle: {
    margin: "8px 0",
    color: "#0E1726",
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 700,
  },
  updateLink: {
    color: "#335CCC",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "10px",
  },
  tag: {
    color: "#0E700E",
    backgroundColor: "#F1FAF1",
    fontSize: "11px",
    lineHeight: "16px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    ...shorthands.padding("2px", "8px"),
    ...shorthands.borderRadius("6px"),
  },
  changedTag: {
    color: "#335CCC",
    backgroundColor: "#E8EFFF",
  },
  fixedTag: {
    color: "#8A5300",
    backgroundColor: "#FFF4CE",
  },
  summary: {
    margin: 0,
    color: "#424242",
    fontSize: "15px",
    lineHeight: "25px",
  },
});

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function updateUrl(link: string): string {
  return new URL(link, updatesData.site.base).href;
}

export default function UpdatesPage() {
  const styles = useStyles();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  };

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
          <h1 className={styles.title}>What's new</h1>
          <p className={styles.description}>{updatesData.site.description}</p>
        </div>
      </header>

      <main className={styles.body}>
        <div className={styles.container}>
          <section className={styles.subscribe}>
            <h2 className={styles.subscribeTitle}>Get told when something matters</h2>
            <p className={styles.subscribeText}>
              This feed carries important announcements only: new assets, meaningful feature updates, and critical
              fixes. It will not notify you about every small change.
            </p>

            <div className={styles.feedRow}>
              <a className={styles.feedLink} href={feedUrl}>
                {feedUrl}
              </a>
              <button
                type="button"
                className={mergeClasses(styles.copyButton, copyStatus === "copied" && styles.copiedButton)}
                onClick={copyFeedUrl}
              >
                <Copy16Regular />
                {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy"}
              </button>
            </div>

            <h3 className={styles.howToTitle}>Set up delivery once</h3>
            <ol className={styles.howToList}>
              <li className={styles.howToItem}>
                <strong>Email in any Outlook:</strong> create a flow in{" "}
                <a className={styles.inlineLink} href="https://make.powerautomate.com/" target="_blank" rel="noreferrer">
                  Power Automate
                </a>{" "}
                using the RSS trigger <em>When a feed item is published</em>, then add <em>Send an email (V2)</em>.
              </li>
              <li className={styles.howToItem}>
                <strong>A Teams channel:</strong> open the channel's <em>Workflows</em>, search for <em>webfeed</em>,
                and choose <strong>Post to a channel when a webfeed item is published</strong>.
              </li>
              <li className={styles.howToItem}>
                <strong>Classic Outlook:</strong> go to <em>File → Account Settings → Account Settings → RSS Feeds → New</em>.
              </li>
              <li className={styles.howToItem}>
                <strong>Any feed reader:</strong> paste the feed address above.
              </li>
            </ol>
          </section>

          {updates.map((update) => (
            <article className={styles.update} key={update.id}>
              <div className={styles.meta}>
                <time dateTime={update.date}>{formatDate(update.date)}</time>
                <span className={styles.tool}>{update.tool}</span>
              </div>
              <h2 className={styles.updateTitle}>
                <a className={styles.updateLink} href={updateUrl(update.link)}>
                  {update.title}
                </a>
              </h2>
              <div className={styles.tags}>
                {update.tags.map((tag) => (
                  <span
                    className={mergeClasses(
                      styles.tag,
                      tag === "Changed" && styles.changedTag,
                      tag === "Fixed" && styles.fixedTag,
                    )}
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className={styles.summary}>{update.summary}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
