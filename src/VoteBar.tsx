import { makeStyles, mergeClasses, shorthands, tokens } from "@fluentui/react-components";
import {
  ThumbLike16Regular,
  ThumbLike16Filled,
  ThumbDislike16Regular,
  ThumbDislike16Filled,
} from "@fluentui/react-icons";
import { useState } from "react";
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
  // Positioning context for the ripple, which is centred on the thumb icon.
  iconWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // A ring the size of the icon that expands outwards and fades as it goes.
  ripple: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "16px",
    height: "16px",
    marginLeft: "-8px",
    marginTop: "-8px",
    ...shorthands.borderRadius("50%"),
    ...shorthands.border("1px", "solid", "#0e700e"),
    pointerEvents: "none",
    animationName: {
      from: { transform: "scale(0.5)", opacity: 0.55 },
      to: { transform: "scale(2.4)", opacity: 0 },
    },
    animationDuration: "450ms",
    animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    animationFillMode: "forwards",
    '@media (prefers-reduced-motion: reduce)': {
      display: "none",
    },
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

  // Bumping this remounts the ripple element, which restarts its animation.
  const [rippleId, setRippleId] = useState(0);
  const voteUp = () => {
    // Ripple only when the click casts a vote, not when it takes one back.
    if (myVote !== "up") setRippleId((id) => id + 1);
    vote("up");
  };
  const thumbUpIcon = (
    <span className={styles.iconWrap}>
      {myVote === "up" ? <ThumbLike16Filled fontSize={16} /> : <ThumbLike16Regular fontSize={16} />}
      {rippleId > 0 && <span key={rippleId} className={styles.ripple} aria-hidden="true" />}
    </span>
  );

  if (variant === "inline") {
    return (
      <div className={mergeClasses(styles.inlineRoot, className)} role="group" aria-label="Was this helpful?">
        <button
          type="button"
          className={mergeClasses(styles.inlineButton, myVote === "up" && styles.inlineUp)}
          aria-pressed={myVote === "up"}
          aria-label={`Thumbs up. ${counts.up} ${counts.up === 1 ? "vote" : "votes"}`}
          disabled={pending}
          onClick={voteUp}
        >
          {thumbUpIcon}
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
        onClick={voteUp}
      >
        {thumbUpIcon}
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
