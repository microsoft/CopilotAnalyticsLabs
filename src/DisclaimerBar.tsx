import { useState } from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";
import { DismissRegular, Info20Regular } from "@fluentui/react-icons";

const FEEDBACK_URL =
  "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR0To00bktq1Ilw6hJ9BCmj5UNTg1QzM4UUs1SzNFM08yUFhVTlJDSDlWUC4u";

const useStyles = makeStyles({
  disclaimerBar: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    minHeight: "48px",
    ...shorthands.padding("4px", "36px"),
    backgroundColor: "#F5F5F5",
    ...shorthands.borderTop("1px", "solid", "#D1D1D1"),
    '@media (max-width: 600px)': {
      ...shorthands.padding("8px", "16px"),
    },
  },
  disclaimerIcon: {
    flexShrink: 0,
    color: "#616161",
    fontSize: "20px",
  },
  disclaimerTextWrap: {
    display: "block",
    flexGrow: 1,
    minWidth: 0,
  },
  disclaimerText: {
    display: "inline",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    color: "#000000",
  },
  disclaimerLink: {
    display: "inline",
    marginLeft: "4px",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 400,
    color: "#335CCC",
    textDecorationLine: "underline",
    whiteSpace: "normal",
    ':hover': {
      color: "#2A4CB0",
    },
  },
  disclaimerDismiss: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "24px",
    height: "24px",
    ...shorthands.padding("2px"),
    ...shorthands.border("none"),
    ...shorthands.borderRadius("4px"),
    backgroundColor: "transparent",
    color: "#424242",
    cursor: "pointer",
    ':hover': {
      backgroundColor: "#EBEBEB",
    },
  },
});

/**
 * Top disclaimer bar shown on every page. Dismissal is kept in memory only, so
 * the bar reappears on a fresh page load (reload brings it back).
 */
export function DisclaimerBar() {
  const styles = useStyles();
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className={styles.disclaimerBar} role="status">
      <Info20Regular className={styles.disclaimerIcon} aria-hidden="true" />
      <div className={styles.disclaimerTextWrap}>
        <span className={styles.disclaimerText}>
          The materials on this page are provided as-is, without warranty of any kind, including merchantability or fitness for a particular purpose. Microsoft will not provide any support for these materials.
        </span>
        <a
          className={styles.disclaimerLink}
          href={FEEDBACK_URL}
          target="_blank"
          rel="noreferrer"
        >
          Learn more
        </a>
      </div>
      <button
        type="button"
        className={styles.disclaimerDismiss}
        onClick={() => setShow(false)}
        aria-label="Dismiss disclaimer"
      >
        <DismissRegular fontSize={16} />
      </button>
    </div>
  );
}
