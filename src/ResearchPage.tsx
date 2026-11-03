import { useEffect, useMemo, useState } from "react";
import { Open16Regular } from "@fluentui/react-icons";
import {
  research,
  researchDomainFilters,
  researchContentTypeFilters,
} from "./data";
import type { ResearchDomainFilter, ResearchContentTypeFilter } from "./data";
import { logClick, logPageView, TelemetryEvents } from "./telemetry";
import { VoteBar } from "./VoteBar";
import { FilterGroup } from "./FilterGroup";
import { PageHeader } from "./PageHeader";
import { PortalCard, PortalText } from "./portal-design";

export default function ResearchPage() {
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
    <div className="labs-container labs-page">
      <PageHeader
        crumb="Research & Playbooks"
        title="Browse all research and playbooks"
        description="Adoption playbooks, methodology guides, benchmarks, and deployment research from real enterprise Copilot rollouts. Filter by domain and content type to find what you need."
      />

      <div className="labs-filters">
        <FilterGroup
          label="Domain"
          groupLabel="Filter by domain"
          options={researchDomainFilters}
          value={domainFilter}
          onChange={setDomainFilter}
        />
        <span className="labs-filters__divider" aria-hidden="true" />
        <FilterGroup
          label="Content type"
          groupLabel="Filter by content type"
          options={researchContentTypeFilters}
          value={contentFilter}
          onChange={setContentFilter}
        />
      </div>

      {!hasResults ? (
        <PortalCard className="data-table-card labs-empty">
          <PortalText as="p" textRole="reading" tone="secondary">
            No research or playbooks match the selected filters.
          </PortalText>
        </PortalCard>
      ) : (
        sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <section key={section.key} className="labs-section" aria-labelledby={`research-${section.key}`}>
              <div className="labs-section__header">
                <PortalText as="h2" id={`research-${section.key}`} textRole="card-title">
                  {section.title}
                </PortalText>
                <span className="labs-badge">{section.items.length}</span>
              </div>
              <div className="labs-card-grid">
                {section.items.map((item) => {
                  const viewLabel = item.kind === "Playbook" ? "View playbook" : "View report";
                  return (
                    <PortalCard key={`${section.key}-${item.id}`} role="article" className="data-table-card labs-card">
                      <div className="labs-tag-row">
                        <span className="labs-badge labs-badge--brand">{item.kind}</span>
                        {item.domain.map((tag) => (
                          <span key={tag} className="labs-badge">
                            {tag}
                          </span>
                        ))}
                        {item.contentType.map((tag) => (
                          <span key={tag} className="labs-badge">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <PortalText as="h3" textRole="card-title" className="labs-card__title">
                        {item.title}
                      </PortalText>
                      <PortalText as="p" textRole="support" tone="secondary">
                        {item.description}
                      </PortalText>
                      <div className="labs-card__footer">
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
                        <VoteBar cardId={item.id} variant="inline" />
                      </div>
                    </PortalCard>
                  );
                })}
              </div>
            </section>
          ))
      )}
    </div>
  );
}
