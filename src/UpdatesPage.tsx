import { useState } from "react";
import { Copy16Regular, Open16Regular } from "@fluentui/react-icons";
import updatesData from "../updates.json";
import { PageHeader } from "./PageHeader";
import { PortalButton, PortalCard, PortalText } from "./portal-design";

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
// The RSS feed keeps its channel description from updates.json; the page uses the short Labs name.
const pageDescription = "Release notes for new Labs templates, sample code, research, playbooks, and important fixes.";

const tagBadgeClass: Record<UpdateTag, string> = {
  Added: "labs-badge labs-badge--success",
  Changed: "labs-badge labs-badge--brand",
  Fixed: "labs-badge labs-badge--warning",
};

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

  const copyLabel = copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy";

  return (
    <div className="labs-container labs-page">
      <PageHeader crumb="What's new" title="What's new" description={pageDescription} />

      <section className="labs-narrow" aria-labelledby="updates-subscribe">
        <PortalCard className="data-table-card labs-card">
          <PortalText as="h2" id="updates-subscribe" textRole="card-title">
            Get told when something matters
          </PortalText>
          <PortalText as="p" textRole="reading" tone="secondary">
            This feed carries important announcements only: new assets, meaningful feature updates, and critical
            fixes. It will not notify you about every small change.
          </PortalText>

          <div className="portal-summary-surface labs-feed">
            <a className="labs-link labs-feed__url" href={feedUrl}>
              {feedUrl}
            </a>
            <PortalButton variant="secondary" onClick={copyFeedUrl}>
              <Copy16Regular aria-hidden="true" />
              {copyLabel}
            </PortalButton>
            {/* The button label changes silently, so announce the result too. */}
            <span className="sr-only" role="status">
              {copyStatus === "idle" ? "" : copyLabel}
            </span>
          </div>

          <PortalText as="h3" textRole="reading" emphasis="semibold" className="labs-card__subheading">
            Set up delivery once
          </PortalText>
          <ol className="labs-ordered-list">
            <li>
              <strong>Email in any Outlook:</strong> create a flow in{" "}
              <a
                className="labs-link"
                href="https://make.powerautomate.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Power Automate (opens in a new tab)"
              >
                Power Automate
                <Open16Regular aria-hidden="true" />
              </a>{" "}
              using the RSS trigger <em>When a feed item is published</em>, then add <em>Send an email (V2)</em>.
            </li>
            <li>
              <strong>A Teams channel:</strong> open the channel's <em>Workflows</em>, search for <em>webfeed</em>,
              and choose <strong>Post to a channel when a webfeed item is published</strong>.
            </li>
            <li>
              <strong>Classic Outlook:</strong> go to <em>File → Account Settings → Account Settings → RSS Feeds → New</em>.
            </li>
            <li>
              <strong>Any feed reader:</strong> paste the feed address above.
            </li>
          </ol>
        </PortalCard>
      </section>

      <div className="labs-narrow labs-update-list">
        {updates.map((update) => (
          <PortalCard key={update.id} role="article" className="data-table-card labs-card">
            <div className="labs-update__meta">
              <time dateTime={update.date}>{formatDate(update.date)}</time>
              <PortalText textRole="metadata" emphasis="semibold">
                {update.tool}
              </PortalText>
            </div>
            <PortalText as="h2" textRole="card-title">
              <a className="labs-title-link" href={updateUrl(update.link)}>
                {update.title}
              </a>
            </PortalText>
            <div className="labs-tag-row">
              {update.tags.map((tag) => (
                <span key={tag} className={tagBadgeClass[tag]}>
                  {tag}
                </span>
              ))}
            </div>
            <PortalText as="p" textRole="reading" tone="secondary">
              {update.summary}
            </PortalText>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
