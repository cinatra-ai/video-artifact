# Video

Plays video artifacts inline in the library. This system extension owns the detail renderer for video files, drawing a native player pointed at the host-authorized preview URL so MP4, WebM, and Ogg files stream and scrub without leaving the page. It claims exactly `video/*`: any video artifact routes to this player, and a container the host does not serve inline degrades to a plain download panel rather than a broken frame.

Install from the Cinatra marketplace by searching for "Video" and clicking Add. No credentials or configuration are required; the renderer is active immediately for all workspace members. Attach or save any MP4, WebM, or Ogg video and open it from the library to watch it inline. Playback is always user-initiated — nothing autoplays — and only the header bytes load up front, so opening a large video is cheap until you press play. For development, edit the manifest in `package.json` or the renderer in `src/renderers/detail.tsx`, then run `node extension-kind-gate.mjs` to validate the package before publishing.

## Works with

- Cinatra library — open any saved video artifact to watch it inline

## Capabilities

- Play MP4, WebM, and Ogg video inline with native browser controls
- Stream and scrub large files over range requests without a full download
- Load only header bytes up front, with no autoplay, until playback starts
- Fall back to a download panel for containers not served inline, never blank
