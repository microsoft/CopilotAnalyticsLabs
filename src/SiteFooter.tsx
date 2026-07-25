import { makeStyles, shorthands } from "@fluentui/react-components";
import { MicrosoftLogoWordmark } from "./App";

const TERMS_URL = "https://www.microsoft.com/en-us/legal/terms-of-use";
const PRIVACY_URL = "https://privacy.microsoft.com/en-us/privacystatement";

const useStyles = makeStyles({
  footer: {
    backgroundColor: "#ffffff",
    boxShadow: "0 -1px 0 rgba(0,0,0,0.08)",
    ...shorthands.padding("24px", "56px"),
    '@media (max-width: 1200px)': {
      ...shorthands.padding("24px", "80px"),
    },
    '@media (max-width: 600px)': {
      ...shorthands.padding("24px", "16px"),
    },
  },
  footerContent: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#424242",
    flexWrap: "wrap",
  },
  separator: {
    width: "1px",
    height: "16px",
    backgroundColor: "#C8C8C8",
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    color: "#424242",
    whiteSpace: "nowrap",
  },
  footerDisclaimer: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "16px",
    color: "#616161",
  },
  footerLinks: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#335CCC",
    fontSize: "12px",
    lineHeight: "16px",
    textDecorationLine: "none",
    ':hover': {
      textDecorationLine: "underline",
    },
  },
});

/**
 * Shared site footer rendered on every page for a consistent layout.
 * Its horizontal margins mirror the SiteHeader (full-bleed with 56px padding).
 */
export function SiteFooter() {
  const styles = useStyles();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <MicrosoftLogoWordmark />
          <div className={styles.separator} />
          <span className={styles.brandTitle}>Copilot Analytics Labs</span>
        </div>

        <p className={styles.footerDisclaimer}>
          Disclaimer: The materials on this page are provided as-is, without warranty of any kind, including merchantability or fitness for a particular purpose. Microsoft will not provide any support for these materials.
        </p>

        <div className={styles.footerLinks}>
          <a className={styles.footerLink} href={TERMS_URL} target="_blank" rel="noreferrer">
            Terms and Conditions
          </a>
          <a className={styles.footerLink} href={PRIVACY_URL} target="_blank" rel="noreferrer">
            Privacy Statement
          </a>
        </div>
      </div>
    </footer>
  );
}
