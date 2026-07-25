import { makeStyles, mergeClasses, shorthands, tokens } from "@fluentui/react-components";
import {
  ThumbLike16Regular,
  ThumbLike16Filled,
  ThumbDislike16Regular,
  ThumbDislike16Filled,
} from "@fluentui/react-icons";
import { useCardVotes } from "./votes";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "12px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    ...shorthands.padding("0"),
    ...shorthands.border("none"),
    backgroundColor: "transparent",
    color: "#242424",
    fontFamily: "inherit",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transitionProperty: "color",
    transitionDuration: "120ms",
    ":hover": {
      color: "#111827",
    },
    ":focus-visible": {
      outlineWidth: "2px",
      outlineStyle: "solid",
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: "1px",
    },
  },
  up: {
    color: "#0e700e",
  },
  down: {
    color: "#b10e1c",
  },
  count: {
    minWidth: "8px",
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
  },
  // Minimal inline variant (Figma "feedback" cluster): bare icon + count, no pill.
  inlineRoot: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: 0,
  },
  inlineButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    ...shorthands.padding("0"),
    ...shorthands.border("none"),
    backgroundColor: "transparent",
    color: "#242424",
    fontFamily: "inherit",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 400,
    cursor: "pointer",
    transitionProperty: "color",
    transitionDuration: "120ms",
    ":hover": {
      color: "#111827",
    },
    ":focus-visible": {
      outlineWidth: "2px",
      outlineStyle: "solid",
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: "2px",
      ...shorthands.borderRadius("4px"),
    },
  },
  inlineUp: {
    color: "#0e700e",
  },
  inlineDown: {
    color: "#b10e1c",
  },
});

interface VoteBarProps {
  cardId: string;
  className?: string;
  variant?: "pill" | "inline";
}

export function VoteBar({ cardId, className, variant = "pill" }: VoteBarProps) {
  const styles = useStyles();
  const { counts, myVote, vote, pending } = useCardVotes(cardId);

  if (variant === "inline") {
    return (
      <div className={mergeClasses(styles.inlineRoot, className)} role="group" aria-label="Was this helpful?">
        <button
          type="button"
          className={mergeClasses(styles.inlineButton, myVote === "up" && styles.inlineUp)}
          aria-pressed={myVote === "up"}
          aria-label={`Thumbs up. ${counts.up} ${counts.up === 1 ? "vote" : "votes"}`}
          disabled={pending}
          onClick={() => vote("up")}
        >
          {myVote === "up" ? <ThumbLike16Filled fontSize={16} /> : <ThumbLike16Regular fontSize={16} />}
          <span className={styles.count}>{counts.up}</span>
        </button>
        <button
          type="button"
          className={mergeClasses(styles.inlineButton, myVote === "down" && styles.inlineDown)}
          aria-pressed={myVote === "down"}
          aria-label={`Thumbs down. ${counts.down} ${counts.down === 1 ? "vote" : "votes"}`}
          disabled={pending}
          onClick={() => vote("down")}
        >
          {myVote === "down" ? (
            <ThumbDislike16Filled fontSize={16} />
          ) : (
            <ThumbDislike16Regular fontSize={16} />
          )}
          <span className={styles.count}>{counts.down}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={mergeClasses(styles.root, className)} role="group" aria-label="Was this helpful?">
      <button
        type="button"
        className={mergeClasses(styles.button, myVote === "up" && styles.up)}
        aria-pressed={myVote === "up"}
        aria-label={`Thumbs up. ${counts.up} ${counts.up === 1 ? "vote" : "votes"}`}
        disabled={pending}
        onClick={() => vote("up")}
      >
        {myVote === "up" ? <ThumbLike16Filled fontSize={16} /> : <ThumbLike16Regular fontSize={16} />}
        <span className={styles.count}>{counts.up}</span>
      </button>
      <button
        type="button"
        className={mergeClasses(styles.button, myVote === "down" && styles.down)}
        aria-pressed={myVote === "down"}
        aria-label={`Thumbs down. ${counts.down} ${counts.down === 1 ? "vote" : "votes"}`}
        disabled={pending}
        onClick={() => vote("down")}
      >
        {myVote === "down" ? (
          <ThumbDislike16Filled fontSize={16} />
        ) : (
          <ThumbDislike16Regular fontSize={16} />
        )}
        <span className={styles.count}>{counts.down}</span>
      </button>
    </div>
  );
}
