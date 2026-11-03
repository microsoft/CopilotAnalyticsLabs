import { useState } from "react";
import { Dismiss20Regular, Info16Regular, Open12Regular } from "@fluentui/react-icons";
import { PortalButton } from "./portal-design";

const FEEDBACK_URL =
  "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UNTg1QzM4UUs1SzNFM08yUFhVTlJDSDlWUC4u";

/**
 * Top disclaimer bar shown on every page. Dismissal is kept in memory only, so
 * the bar reappears on a fresh page load (reload brings it back).
 */
export function DisclaimerBar() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="labs-disclaimer" role="status">
      <div className="labs-container labs-container--full labs-disclaimer__inner">
        <Info16Regular className="labs-disclaimer__icon" aria-hidden="true" />
        <p className="labs-disclaimer__text">
          The materials on this page are provided as-is, without warranty of any kind, including merchantability or fitness for a particular purpose. Microsoft will not provide any support for these materials.{" "}
          <a
            className="labs-link labs-link--standalone"
            href={FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Learn more (opens in a new tab)"
          >
            Learn more
            <Open12Regular aria-hidden="true" />
          </a>
        </p>
        <PortalButton
          variant="subtle"
          iconOnly
          aria-label="Dismiss disclaimer"
          onClick={() => setShow(false)}
        >
          <Dismiss20Regular />
        </PortalButton>
      </div>
    </div>
  );
}
