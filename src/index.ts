// `@cinatra-ai/video-artifact` — the system video renderer.
//
// A system-base artifact extension that owns the DETAIL renderer for video
// artifacts, declaring exactly the three forms the type accepts — video/mp4,
// video/webm and video/ogg. The renderer points a native video element at the
// address the byte road resolves (the byte reference at props version 2, the
// session href at the older version), streaming via range requests, with a
// never-blank floor for containers the host does not serve inline.
//
// The authoritative manifest is `package.json#cinatra`; this module is the
// package entry that exposes the renderer the host mounts.
export {
  default,
  VideoArtifactDetail,
  VIDEO_RENDERER_PROPS_API_VERSION,
} from "./renderers/detail";
export type { VideoArtifactDetailProps } from "./renderers/detail";
export { resolveByteRoad } from "./renderers/byte-road";
export type { ByteRoadName, ByteRoadSnapshot, ResolvedByteRoad } from "./renderers/byte-road";
