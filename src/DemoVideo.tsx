import { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { Play16Filled } from "@fluentui/react-icons";
import { logClick, TelemetryEvents } from "./telemetry";

const useStyles = makeStyles({
  surface: {
    maxWidth: "min(1040px, 92vw)",
    width: "min(1040px, 92vw)",
  },
  video: {
    width: "100%",
    height: "auto",
    display: "block",
    backgroundColor: "#000000",
    ...shorthands.borderRadius("6px"),
  },
  fallback: {
    fontSize: "14px",
    lineHeight: "20px",
    color: "#424242",
  },
});

interface DemoVideoButtonProps {
  /** Template id — used for telemetry. */
  id: string;
  /** Template title — used for the dialog heading and the video aria-label. */
  title: string;
  /**
   * Direct MP4 URL. Use the github.com/<org>/<repo>/raw/<branch>/... form:
   * it supports range requests, so the video streams and seeks.
   */
  videoUrl: string;
  /** Button class, so each surface keeps its own card-button styling. */
  className?: string;
}

/**
 * "Watch demo" button that plays the demo inline in a dialog.
 *
 * GitHub serves MP4s as application/octet-stream, so navigating to the URL
 * directly downloads the file rather than playing it. Inside a <video> element
 * the explicit <source type="video/mp4"> tells the browser what to expect, so
 * playback works — the same approach the Analytics Hub uses.
 */
export function DemoVideoButton({ id, title, videoUrl, className }: DemoVideoButtonProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setOpen(true);
          logClick(TelemetryEvents.TemplateDemoClick, { template: id });
        }}
      >
        <Play16Filled fontSize={12} />
        Watch demo
      </button>

      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface className={styles.surface}>
          <DialogBody>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              {/* Only mount the video while the dialog is open, so closing it
                  stops playback and releases the download. */}
              {open ? (
                <video
                  className={styles.video}
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={`${title} demo video`}
                >
                  <source src={videoUrl} type="video/mp4" />
                  <p className={styles.fallback}>
                    Your browser cannot play this video.{" "}
                    <a href={videoUrl} target="_blank" rel="noreferrer">
                      Download it instead
                    </a>
                    .
                  </p>
                </video>
              ) : null}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
