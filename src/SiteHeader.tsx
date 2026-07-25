import { useState } from "react";
import { makeStyles, mergeClasses, shorthands } from "@fluentui/react-components";
import { Copy16Regular, PersonFeedback20Regular, PersonFeedback24Filled } from "@fluentui/react-icons";
import { MicrosoftLogoWordmark } from "./App";

const VIVA_INSIGHTS_URL = "https://analysis.insights.cloud.microsoft/";
const FEEDBACK_URL =
  "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UNTg1QzM4UUs1SzNFM08yUFhVTlJDSDlWUC4u";

const useStyles = makeStyles({
  nav: {
    position: "sticky",
    top: "0",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "48px",
    backgroundColor: "#ffffff",
    ...shorthands.padding("0", "56px"),
    boxShadow: "0 1px 0 rgba(0, 0, 0, 0.08)",
    '@media (max-width: 1200px)': {
      ...shorthands.padding("0", "80px"),
    },
    '@media (max-width: 600px)': {
      height: "auto",
      flexDirection: "column",
      alignItems: "stretch",
      ...shorthands.padding("8px", "16px"),
      gap: "4px",
    },
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minHeight: "48px",
    color: "#424242",
    ...shorthands.padding("0", "8px", "1px"),
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
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minHeight: "48px",
    ...shorthands.padding("0", "40px"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("0"),
      justifyContent: "flex-start",
      overflowX: "auto",
      gap: "12px",
      minHeight: "36px",
    },
  },
  navLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#242424",
    fontSize: "14px",
    lineHeight: "20px",
    textDecorationLine: "none",
    whiteSpace: "nowrap",
    padding: "0 12px",
    height: "48px",
    ':hover': {
      backgroundColor: "#1F1F1F",
      color: "#ffffff",
    },
  },
  navIconOnly: {
    width: "48px",
    height: "48px",
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#242424",
    backgroundColor: "transparent",
    ':hover': {
      backgroundColor: "#1F1F1F",
      color: "#ffffff",
    },
  },
});

/**
 * Shared top navigation bar rendered on every page for a consistent header.
 * Includes the Microsoft brand, quick links, and the Contact Us dialog.
 */
export function SiteHeader() {
  const styles = useStyles();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <MicrosoftLogoWordmark />
          <div className={styles.separator} />
          <span className={styles.brandTitle}>Copilot Analytics Labs</span>
        </div>

        <div className={styles.navLinks}>
          <a className={styles.navLink} href={VIVA_INSIGHTS_URL} target="_blank" rel="noreferrer">
            <img src={`${import.meta.env.BASE_URL}images/VI.svg`} alt="" width="20" height="20" aria-hidden="true" />
            <span>Insights</span>
          </a>
          <a className={styles.navLink} href={FEEDBACK_URL} target="_blank" rel="noreferrer">
            <span>Feedback</span>
          </a>
          <button
            className={mergeClasses(styles.navLink, styles.navIconOnly)}
            onClick={() => setShowContactDialog(true)}
            aria-label="Contact us"
            style={{ border: "none", cursor: "pointer" }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px" }}>
              <PersonFeedback20Regular fontSize={16} />
            </span>
          </button>
        </div>
      </nav>

      {showContactDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowContactDialog(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "420px",
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              textAlign: "center",
              fontFamily: '"Segoe UI", system-ui, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#E8F3FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <PersonFeedback24Filled style={{ fontSize: "40px", color: "#335CCC" }} />
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 600, color: "#242424" }}>
              Contact Us
            </h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", color: "#616161", whiteSpace: "nowrap" }}>
                For further questions and doubts — Please drop a mail to
              </span>
              <a href="mailto:CopilotAnalyticsLabs@microsoft.com" style={{ color: "#0078D4", textDecoration: "none", fontWeight: 600 }}>
                CopilotAnalyticsLabs@microsoft.com
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("CopilotAnalyticsLabs@microsoft.com");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#0078D4",
                  padding: "0",
                  width: "20px",
                  height: "20px",
                }}
                title="Copy email address"
              >
                <Copy16Regular style={{ fontSize: "16px" }} />
              </button>
            </div>
            {copied && (
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#10A038", fontWeight: 600 }}>
                Copied to clipboard!
              </p>
            )}
            <button
              onClick={() => setShowContactDialog(false)}
              style={{
                padding: "8px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "#335CCC",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
