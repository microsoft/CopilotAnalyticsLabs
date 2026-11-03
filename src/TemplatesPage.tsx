import { useEffect, useMemo, useState } from "react";
import { Open16Regular } from "@fluentui/react-icons";
import {
  templates,
  templateTypeFilters,
  templatePageImpactFilters,
  pageImpactToTag,
} from "./data";
import type { TemplateTypeFilter, TemplatePageImpactFilter } from "./data";
import { logClick, logPageView, TelemetryEvents } from "./telemetry";
import { VoteBar } from "./VoteBar";
import { DemoVideoButton } from "./DemoVideo";
import { FilterGroup } from "./FilterGroup";
import { PageHeader } from "./PageHeader";
import { PortalCard, PortalText } from "./portal-design";

export default function TemplatesPage() {
  const [typeFilter, setTypeFilter] = useState<TemplateTypeFilter>("All");
  const [impactFilter, setImpactFilter] = useState<TemplatePageImpactFilter>("All");

  useEffect(() => {
    logPageView();
  }, []);

  const sections = useMemo(() => {
    const impactTag = pageImpactToTag(impactFilter);
    const filtered = templates.filter(
      (item) =>
        (typeFilter === "All" || item.type === typeFilter) &&
        (impactTag === null || item.impact.includes(impactTag)),
    );

    // "New and Popular" mirrors the home page logic: most recently added first, capped.
    const newAndPopular = [...filtered]
      .sort((a, b) => (b.addedOn ?? "").localeCompare(a.addedOn ?? ""))
      .slice(0, 3);

    return [
      { key: "new", title: "New and Popular", items: newAndPopular },
      {
        key: "abv",
        title: "AI Business Value templates",
        items: filtered.filter((item) => item.collections.includes("AI Business Value")),
      },
      {
        key: "m365",
        title: "Microsoft 365 templates",
        items: filtered.filter((item) => item.collections.includes("Microsoft 365")),
      },
    ];
  }, [typeFilter, impactFilter]);

  const hasResults = sections.some((section) => section.items.length > 0);

  return (
    <div className="labs-container labs-page">
      <PageHeader
        crumb="Templates"
        title="Browse all templates"
        description="Production-ready dashboards for Copilot, GitHub Copilot, and business value analytics. Filter by product type and impact scope to find the right starting point."
      />

      <div className="labs-filters">
        <FilterGroup
          label="Type"
          groupLabel="Filter by type"
          options={templateTypeFilters}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <span className="labs-filters__divider" aria-hidden="true" />
        <FilterGroup
          label="Impact"
          groupLabel="Filter by impact"
          options={templatePageImpactFilters}
          value={impactFilter}
          onChange={setImpactFilter}
        />
      </div>

      {!hasResults ? (
        <PortalCard className="data-table-card labs-empty">
          <PortalText as="p" textRole="reading" tone="secondary">
            No templates match the selected filters.
          </PortalText>
        </PortalCard>
      ) : (
        sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <section key={section.key} className="labs-section" aria-labelledby={`templates-${section.key}`}>
              <div className="labs-section__header">
                <PortalText as="h2" id={`templates-${section.key}`} textRole="card-title">
                  {section.title}
                </PortalText>
                <span className="labs-badge">{section.items.length}</span>
              </div>
              <div className="labs-card-grid">
                {section.items.map((item) => {
                  const viewLink = (
                    <a
                      className="secondary-button"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View template: ${item.title} (opens in a new tab)`}
                      onClick={() => logClick(TelemetryEvents.TemplateViewClick, { template: item.id })}
                    >
                      View template
                      <Open16Regular aria-hidden="true" />
                    </a>
                  );

                  return (
                    <PortalCard key={item.id} role="article" className="data-table-card labs-card">
                      {item.image ? (
                        <img
                          className={`labs-card__media${item.imageIsIllustration ? " labs-card__media--contain" : ""}`}
                          src={item.image}
                          alt=""
                        />
                      ) : null}
                      <div className="labs-tag-row">
                        <span className="labs-badge labs-badge--brand">{item.type}</span>
                        {item.impact.map((tag) => (
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
                      {item.videoUrl || item.setupVideoUrl ? (
                        // Primary actions, a rule, then the setup video and votes.
                        <div className="labs-card__footer labs-card__footer--stacked">
                          <div className="labs-card__actions">
                            {viewLink}
                            {item.videoUrl ? (
                              <DemoVideoButton id={item.id} title={item.title} videoUrl={item.videoUrl} />
                            ) : null}
                          </div>
                          <div className="labs-card__divider" aria-hidden="true" />
                          <div className="labs-card__meta-row">
                            {item.setupVideoUrl ? (
                              <DemoVideoButton
                                id={`${item.id}-setup`}
                                title={item.title}
                                videoUrl={item.setupVideoUrl}
                                label="Watch setup"
                                variant="subtle"
                                tone="brand"
                              />
                            ) : null}
                            <VoteBar cardId={item.id} variant="inline" />
                          </div>
                        </div>
                      ) : (
                        <div className="labs-card__footer">
                          {viewLink}
                          <VoteBar cardId={item.id} variant="inline" />
                        </div>
                      )}
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
