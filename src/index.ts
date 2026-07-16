// `@cinatra-ai/video-artifact` — the system video renderer.
//
// A system-base artifact extension that owns the DETAIL renderer for video
// artifacts (MP4/WebM/Ogg), claiming exactly `video/*`. The renderer is a
// port of the host video handler: a native `<video>` element pointed at the
// host-authorized preview URL, streaming via range requests, with a
// never-blank floor for containers the host does not serve inline.
//
// The authoritative manifest is `package.json#cinatra`; this module is the
// package entry that exposes the renderer the host mounts.
export { default, VideoArtifactDetail } from "./renderers/detail";
export type { VideoArtifactDetailProps } from "./renderers/detail";
