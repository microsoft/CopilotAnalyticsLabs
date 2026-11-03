import {
  ThumbLike16Regular,
  ThumbLike16Filled,
  ThumbDislike16Regular,
  ThumbDislike16Filled,
} from "@fluentui/react-icons";
import { useState } from "react";
import { useCardVotes } from "./votes";

interface VoteBarProps {
  cardId: string;
  className?: string;
  /** "pill" has semibold counts and sits 12px below the content above it. "inline" is the
      minimal Figma "feedback" cluster (bare icon + count) for card footers. */
  variant?: "pill" | "inline";
}

export function VoteBar({ cardId, className, variant = "pill" }: VoteBarProps) {
  const { counts, myVote, vote, pending } = useCardVotes(cardId);

  // Bumping this remounts the ripple element, which restarts its animation.
  const [rippleId, setRippleId] = useState(0);
  const voteUp = () => {
    // Ripple only when the click casts a vote, not when it takes one back.
    if (myVote !== "up") setRippleId((id) => id + 1);
    vote("up");
  };

  const rootClassName = ["labs-vote", variant === "inline" && "labs-vote--inline", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} role="group" aria-label="Was this helpful?">
      <button
        type="button"
        className="labs-vote__button labs-vote__button--up"
        aria-pressed={myVote === "up"}
        aria-label={`Thumbs up. ${counts.up} ${counts.up === 1 ? "vote" : "votes"}`}
        disabled={pending}
        onClick={voteUp}
      >
        <span className="labs-vote__icon">
          {myVote === "up" ? <ThumbLike16Filled aria-hidden="true" /> : <ThumbLike16Regular aria-hidden="true" />}
          {rippleId > 0 && <span key={rippleId} className="labs-vote__ripple" aria-hidden="true" />}
        </span>
        <span className="labs-vote__count">{counts.up}</span>
      </button>
      <button
        type="button"
        className="labs-vote__button labs-vote__button--down"
        aria-pressed={myVote === "down"}
        aria-label={`Thumbs down. ${counts.down} ${counts.down === 1 ? "vote" : "votes"}`}
        disabled={pending}
        onClick={() => vote("down")}
      >
        <span className="labs-vote__icon">
          {myVote === "down" ? (
            <ThumbDislike16Filled aria-hidden="true" />
          ) : (
            <ThumbDislike16Regular aria-hidden="true" />
          )}
        </span>
        <span className="labs-vote__count">{counts.down}</span>
      </button>
    </div>
  );
}
