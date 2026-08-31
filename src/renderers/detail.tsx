/**
 * Video artifact detail renderer.
 *
 * Renders an allowlisted video artifact (MP4/WebM/Ogg) with a native `video`
 * element pointed at the address the host handed it. Range requests on that
 * address make playback stream-friendly: browsers issue `bytes=0-` for playback
 * and follow-up ranges when the user scrubs. There is no client JS driving
 * playback — the browser's media stack does the work, so there is nothing to
 * hydrate.
 *
 * THE ADDRESS COMES FROM THE BYTE ROAD. A media element's load is a subresource
 * request, and inside a third-party application it carries no cookie — so a
 * player pointed at the host's session route plays nothing there. At props
 * version 2 the snapshot carries the byte reference the reader may actually
 * fetch on the surface they are on, and this renderer paints from it; a
 * snapshot built at the older version has no reference, falls back to the
 * session href, and still plays. The renderer builds no address of its own and
 * fetches nothing itself.
 *
 * `preload="metadata"` fetches only the moov/header bytes up front (duration +
 * dimensions for the controls), not the whole file. No autoplay — playback is
 * always user-initiated.
 *
 * Never-blank: when no road carries a playable address (a container the host
 * does not serve inline, or a representation that is not yet materialized), the
 * renderer draws a plain metadata panel instead of mounting a broken player.
 * Malformed or partial props degrade to the same panel rather than throwing.
 */
import type { ReactElement } from "react";

import { resolveByteRoad, type ByteRoadName } from "./byte-road";

/** The props version this renderer declares in the manifest — the version at
 *  which the snapshot carries the byte reference. */
export const VIDEO_RENDERER_PROPS_API_VERSION = 2;

/**
 * The host-supplied, authorized, JSON-serializable snapshot subset this
 * renderer reads. Structurally compatible with the host artifact-renderer props
 * contract: the host mounts the component with the full snapshot; this renderer
 * consumes only the fields below and tolerates missing ones so a malformed
 * snapshot degrades to the floor instead of throwing.
 */
export interface VideoArtifactDetailProps {
  readonly propsApiVersion?: number;
  readonly artifact?: {
    readonly title?: string | null;
    readonly mime?: string | null;
  } | null;
  /** The host's SESSION addresses — the fallback road at the older version. */
  readonly urls?: {
    readonly preview?: string | null;
    readonly download?: string | null;
  } | null;
  readonly actions?: { readonly download?: string | null } | null;
  /** THE BYTE REFERENCE (props version 2). Absent on an older snapshot. */
  readonly bytes?: {
    readonly road?: string;
    readonly preview?: string | null;
    readonly download?: string | null;
  } | null;
}

function VideoUnavailable({
  title,
  mime,
  downloadHref,
  road,
}: {
  title: string | null;
  mime: string | null;
  downloadHref: string | null;
  road: ByteRoadName;
}): ReactElement {
  const suffix = title ? `: ${title}` : ".";
  return (
    <article className="soft-panel rounded-card p-4" data-byte-road={road}>
      <p className="text-sm text-muted-foreground">
        This video cannot be played inline{mime ? ` (${mime})` : ""}. Download
        the file to view it{suffix}
      </p>
      {downloadHref ? (
        <a href={downloadHref} className="text-sm underline" download>
          Download the video
        </a>
      ) : null}
    </article>
  );
}

export function VideoArtifactDetail(props: VideoArtifactDetailProps): ReactElement {
  const bytes = resolveByteRoad(props);
  const title = props?.artifact?.title ?? null;
  const mime = props?.artifact?.mime ?? null;

  if (!bytes.preview) {
    return (
      <VideoUnavailable
        title={title}
        mime={mime}
        downloadHref={bytes.download}
        road={bytes.road}
      />
    );
  }

  return (
    <article
      className="soft-panel rounded-card overflow-hidden p-0"
      data-byte-road={bytes.road}
    >
      {/* No caption sidecar: an artifact is a single blob, and the same address
          serves the same bytes for assistive tooling. */}
      <video
        src={bytes.preview}
        controls
        preload="metadata"
        className="mx-auto block max-h-[75vh] w-full bg-black"
        aria-label="Video preview"
      />
    </article>
  );
}

export default VideoArtifactDetail;
