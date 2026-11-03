import { Open16Regular } from "@fluentui/react-icons";
import { MicrosoftLogoWordmark } from "./MicrosoftLogoWordmark";

const TERMS_URL = "https://www.microsoft.com/en-us/legal/terms-of-use";
const PRIVACY_URL = "https://privacy.microsoft.com/en-us/privacystatement";

/**
 * Shared site footer rendered on every page for a consistent layout.
 * Like the DisclaimerBar, it runs wider than the content column (64px from the window edges).
 */
export function SiteFooter() {
  return (
    <footer className="labs-site-footer">
      <div className="labs-container labs-container--full labs-site-footer__inner">
        <div className="labs-brand">
          <MicrosoftLogoWordmark />
          <span className="labs-brand__divider" aria-hidden="true" />
          <span className="labs-brand__title">Labs</span>
        </div>

        <p>
          Disclaimer: The materials on this page are provided as-is, without warranty of any kind, including merchantability or fitness for a particular purpose. Microsoft will not provide any support for these materials.
        </p>

        <div className="labs-site-footer__links">
          <a
            className="labs-link labs-link--standalone"
            href={TERMS_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Terms and Conditions (opens in a new tab)"
          >
            Terms and Conditions
            <Open16Regular aria-hidden="true" />
          </a>
          <a
            className="labs-link labs-link--standalone"
            href={PRIVACY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Privacy Statement (opens in a new tab)"
          >
            Privacy Statement
            <Open16Regular aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
