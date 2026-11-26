import { useEffect, useState } from "react";
import {
  CounterBadge,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Tooltip,
} from "@fluentui/react-components";
import { Copy20Regular, Megaphone20Regular, Open16Regular, PersonFeedback20Regular } from "@fluentui/react-icons";
import { markAnnouncementsOpened, newAnnouncementCount } from "./announcements";
import { MicrosoftLogoWordmark } from "./MicrosoftLogoWordmark";
import { PortalButton, PortalText } from "./portal-design";

const BUSINESS_ANALYTICS_URL = "https://msit.a365analytics.cloud.microsoft";
const FEEDBACK_URL =
  "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UNTg1QzM4UUs1SzNFM08yUFhVTlJDSDlWUC4u";
const CONTACT_EMAIL = "CopilotAnalyticsLabs@microsoft.com";

const isWhatsNewRoute = () => window.location.hash.replace(/^#/, "") === "/updates";

/**
 * Shared top navigation bar rendered on every page for a consistent header.
 * Includes the Microsoft brand, quick links, the Announcements link and the Contact Us dialog.
 */
export function SiteHeader() {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  // Updates added since the user's last session. Opening What's new clears the dot.
  const [newAnnouncements, setNewAnnouncements] = useState(() => {
    const count = newAnnouncementCount();
    return isWhatsNewRoute() ? 0 : count;
  });

  useEffect(() => {
    if (isWhatsNewRoute()) markAnnouncementsOpened();
    const onHashChange = () => {
      if (!isWhatsNewRoute()) return;
      markAnnouncementsOpened();
      setNewAnnouncements(0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const announcementsLabel = newAnnouncements > 0 ? `Announcements, ${newAnnouncements} new` : "Announcements";

  return (
    <header className="labs-site-header">
      <div className="labs-container labs-site-header__inner">
        <div className="labs-brand">
          <MicrosoftLogoWordmark />
          <span className="labs-brand__divider" aria-hidden="true" />
          <a
            className="labs-brand__title labs-brand__home"
            href={`${import.meta.env.BASE_URL}#/`}
            aria-label="Labs home"
            onClick={() => {
              // Already home: the hash doesn't change, so return to the top here.
              if (window.location.hash.replace(/^#/, "") === "/" || window.location.hash === "") {
                window.scrollTo(0, 0);
              }
            }}
          >
            Labs
          </a>
        </div>

        <nav aria-label="Site" className="labs-site-nav">
          <a
            className="tertiary-button"
            href={BUSINESS_ANALYTICS_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Business Analytics (opens in a new tab)"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/business-analytics-logo.svg`}
              alt=""
              width="16"
              height="16"
            />
            Business Analytics
            <Open16Regular aria-hidden="true" />
          </a>
          <a
            className="tertiary-button"
            href={FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Feedback (opens in a new tab)"
          >
            Feedback
            <Open16Regular aria-hidden="true" />
          </a>
          <div className="labs-site-nav__actions">
            {/* The link's own aria-label wins over the tooltip's, so it can carry the new count. */}
            <Tooltip content="Announcements" relationship="label" withArrow>
              <a
                className="tertiary-button labs-announcements"
                data-icon-only="true"
                href={`${import.meta.env.BASE_URL}#/updates`}
                aria-label={announcementsLabel}
              >
                <Megaphone20Regular aria-hidden="true" />
                {newAnnouncements > 0 ? (
                  <CounterBadge
                    className="labs-announcements__dot"
                    count={newAnnouncements}
                    dot
                    size="tiny"
                    color="danger"
                    aria-hidden="true"
                  />
                ) : null}
              </a>
            </Tooltip>
            <Tooltip content="Contact us" relationship="label" withArrow>
              <PortalButton
                variant="subtle"
                iconOnly
                aria-label="Contact us"
                onClick={() => setShowContactDialog(true)}
              >
                <PersonFeedback20Regular />
              </PortalButton>
            </Tooltip>
          </div>
        </nav>
      </div>

      <Dialog open={showContactDialog} onOpenChange={(_, data) => setShowContactDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogContent>
              <div className="labs-contact">
                <PortalText as="p" textRole="reading" tone="secondary">
                  For further questions and doubts, please drop a mail to
                </PortalText>
                <div className="labs-contact__email">
                  <a className="labs-link" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                  <Tooltip content="Copy email address" relationship="label" withArrow>
                    <PortalButton
                      variant="subtle"
                      iconOnly
                      aria-label="Copy email address"
                      onClick={() => {
                        navigator.clipboard.writeText(CONTACT_EMAIL);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      <Copy20Regular />
                    </PortalButton>
                  </Tooltip>
                </div>
                <span role="status" className="labs-contact__status">
                  {copied ? "Copied to clipboard!" : ""}
                </span>
              </div>
            </DialogContent>
            <DialogActions>
              <PortalButton variant="secondary" onClick={() => setShowContactDialog(false)}>
                Close
              </PortalButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </header>
  );
}
