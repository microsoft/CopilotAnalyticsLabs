import { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  makeStyles,
} from "@fluentui/react-components";
import { Dismiss20Regular, Open16Regular, Play16Regular } from "@fluentui/react-icons";
import { PortalButton, PortalText, type PortalButtonProps } from "./portal-design";
import { logClick, TelemetryEvents } from "./telemetry";

// Layout only: widen Fluent's 600px dialog so the video has room. Set through makeStyles so it
// merges with (and overrides) the DialogSurface's own Griffel max-width.
const useStyles = makeStyles({
  surface: {
    maxWidth: "min(1040px, 92vw)",
    width: "min(1040px, 92vw)",
  },
});

interface DemoVideoButtonProps {
  /** Template id, used for telemetry. */
  id: string;
  /** Template title, used for the dialog heading and the video aria-label. */
  title: string;
  /**
   * Direct MP4 URL. Use the github.com/<org>/<repo>/raw/<branch>/... form:
   * it supports range requests, so the video streams and seeks.
   */
  videoUrl: string;
  /** Button label. Defaults to "Play demo". */
  label?: string;
  /** Portal button variant, so each surface keeps its own button hierarchy. Defaults to secondary. */
  variant?: PortalButtonProps["variant"];
  /** Brand-colored label, for subtle buttons that act as a link-like action. */
  tone?: PortalButtonProps["tone"];
  /** Extra class for layout. */
  className?: string;
}

/**
 * "Play demo" button that plays the demo inline in a dialog.
 *
 * GitHub serves MP4s as application/octet-stream, so navigating to the URL
 * directly downloads the file rather than playing it. Inside a <video> element
 * the explicit <source type="video/mp4"> tells the browser what to expect, so
 * playback works. The Analytics Hub uses the same approach.
 */
export function DemoVideoButton({
  id,
  title,
  videoUrl,
  label = "Play demo",
  variant = "secondary",
  tone,
  className,
}: DemoVideoButtonProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const videoKind = label.replace(/^(Watch|Play)\s+/i, "");
  const heading =
    label === "Play demo" ? title : `${title}: ${videoKind.charAt(0).toUpperCase()}${videoKind.slice(1)}`;

  return (
    <>
      <PortalButton
        variant={variant}
        tone={tone}
        className={className}
        aria-label={`${label}: ${title}`}
        onClick={() => {
          setOpen(true);
          logClick(TelemetryEvents.TemplateDemoClick, { template: id });
        }}
      >
        <Play16Regular aria-hidden="true" />
        {label}
      </PortalButton>

      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface className={styles.surface}>
          <DialogBody>
            <DialogTitle
              action={
                <PortalButton variant="subtle" iconOnly aria-label="Close" onClick={() => setOpen(false)}>
                  <Dismiss20Regular />
                </PortalButton>
              }
            >
              {heading}
            </DialogTitle>
            <DialogContent>
              {/* Only mount the video while the dialog is open, so closing it
                  stops playback and releases the download. */}
              {open ? (
                <video
                  className="labs-video"
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={`${title} ${label} video`}
                >
                  <source src={videoUrl} type="video/mp4" />
                  <PortalText as="p" textRole="reading" tone="secondary">
                    Your browser cannot play this video.{" "}
                    <a
                      className="labs-link"
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Download it instead (opens in a new tab)"
                    >
                      Download it instead
                      <Open16Regular aria-hidden="true" />
                    </a>
                    .
                  </PortalText>
                </video>
              ) : null}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
