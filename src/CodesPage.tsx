import { useEffect, useMemo, useState } from "react";
import { DocumentBulletList24Regular, Open16Regular } from "@fluentui/react-icons";
import {
  resources,
  codeDomainFilters,
  codeTechFilters,
} from "./data";
import type { CodeDomainFilter, CodeTechFilter } from "./data";
import { logClick, logPageView, TelemetryEvents } from "./telemetry";
import { VoteBar } from "./VoteBar";
import { FilterGroup } from "./FilterGroup";
import { PageHeader } from "./PageHeader";
import { PortalCard, PortalText } from "./portal-design";

export default function CodesPage() {
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
    <div className="labs-container labs-page">
      <PageHeader
        crumb="Sample code"
        title="Browse all sample code"
        description="Reusable scripts, prompt libraries, and analytical methods for Python, R, Power BI, and more. Filter by analysis focus and language to find the right starting point."
      />

      <div className="labs-filters">
        <FilterGroup
          label="Analysis Focus"
          groupLabel="Filter by analysis focus"
          options={codeDomainFilters}
          value={domainFilter}
          onChange={setDomainFilter}
        />
        <span className="labs-filters__divider" aria-hidden="true" />
        <FilterGroup
          label="Language & Tool"
          groupLabel="Filter by language and tool"
          options={codeTechFilters}
          value={techFilter}
          onChange={setTechFilter}
        />
      </div>

      {!hasResults ? (
        <PortalCard className="data-table-card labs-empty">
          <PortalText as="p" textRole="reading" tone="secondary">
            No sample code matches the selected filters.
          </PortalText>
        </PortalCard>
      ) : (
        sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <section key={section.key} className="labs-section" aria-labelledby={`codes-${section.key}`}>
              <div className="labs-section__header">
                <PortalText as="h2" id={`codes-${section.key}`} textRole="card-title">
                  {section.title}
                </PortalText>
                <span className="labs-badge">{section.items.length}</span>
              </div>
              <div className="labs-card-grid">
                {section.items.map((item) => {
                  const Icon = item.icon ?? DocumentBulletList24Regular;
                  return (
                    <PortalCard key={item.id} role="article" className="data-table-card labs-card">
                      {item.image ? (
                        // Contain (not cover) so the square illustrations render at their natural
                        // proportions and stay centred, matching the L1 sample-code cards.
                        <img className="labs-card__media labs-card__media--contain" src={item.image} alt="" />
                      ) : (
                        <div className="labs-card__media labs-card__media--icon">
                          <Icon aria-hidden="true" />
                        </div>
                      )}
                      <div className="labs-tag-row">
                        {item.tech.map((tag) => (
                          <span key={tag} className="labs-badge labs-badge--brand">
                            {tag}
                          </span>
                        ))}
                        {item.domain.map((tag) => (
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
                          aria-label={`View code: ${item.title} (opens in a new tab)`}
                          onClick={() => logClick(TelemetryEvents.CodeViewClick, { resource: item.id })}
                        >
                          View code
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
