/**
 * Video artifact detail renderer.
 *
 * Renders an allowlisted video artifact (MP4/WebM/Ogg) with a native `<video>`
 * element pointed at the host-authorized preview URL. Range requests on that
 * URL make playback stream-friendly: browsers issue `bytes=0-` for playback and
 * follow-up ranges when the user scrubs. There is no client JS driving
 * playback — the browser's media stack does the work, so there is nothing to
 * hydrate.
 *
 * `preload="metadata"` fetches only the moov/header bytes up front (duration +
 * dimensions for the controls), not the whole file. No autoplay — playback is
 * always user-initiated.
 *
 * Never-blank: when the host supplies no inline-playable preview URL (a video
 * container the host does not serve inline, or a representation that is not yet
 * materialized), the renderer draws a plain metadata panel instead of mounting
 * a broken `<video>`. Malformed or partial props degrade to the same panel
 * rather than throwing.
 */
import type { ReactElement } from "react";

/**
 * The host-supplied, authorized, JSON-serializable snapshot subset this
 * renderer reads. Structurally compatible with the host artifact-renderer props
 * contract: the host mounts `<Detail {...props} />` with the full snapshot;
 * this renderer consumes only the fields below and tolerates missing ones so a
 * malformed snapshot degrades to the floor instead of throwing.
 */
export interface VideoArtifactDetailProps {
  readonly artifact?: {
    readonly title?: string | null;
    readonly mime?: string | null;
  } | null;
  readonly urls?: {
    readonly preview?: string | null;
  } | null;
}

function VideoUnavailable({
  title,
  mime,
}: {
  title: string | null;
  mime: string | null;
}): ReactElement {
  const suffix = title ? `: ${title}` : ".";
  return (
    <article className="soft-panel rounded-card p-4">
      <p className="text-sm text-muted-foreground">
        This video cannot be played inline{mime ? ` (${mime})` : ""}. Download
        the file to view it{suffix}
      </p>
    </article>
  );
}

export function VideoArtifactDetail(props: VideoArtifactDetailProps): ReactElement {
  const previewHref = props?.urls?.preview ?? null;
  const title = props?.artifact?.title ?? null;
  const mime = props?.artifact?.mime ?? null;

  if (!previewHref) {
    return <VideoUnavailable title={title} mime={mime} />;
  }

  return (
    <article className="soft-panel rounded-card overflow-hidden p-0">
      {/* No <track>: an artifact is a single blob with no caption sidecar; the
          download route serves the same bytes for assistive tooling. */}
      <video
        src={previewHref}
        controls
        preload="metadata"
        className="mx-auto block max-h-[75vh] w-full bg-black"
        aria-label="Video preview"
      />
    </article>
  );
}

export default VideoArtifactDetail;
