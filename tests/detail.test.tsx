import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import {
  VideoArtifactDetail,
  default as DefaultExport,
  type VideoArtifactDetailProps,
} from "../src/renderers/detail";

afterEach(() => cleanup());

const withPreview = {
  artifact: { title: "Launch demo", mime: "video/mp4" },
  urls: { preview: "/api/artifacts/abc/versions/v1/preview" },
};

describe("VideoArtifactDetail — inline playback (host video-handler port)", () => {
  it("mounts a native <video> pointed at the host-authorized preview URL", () => {
    const { container } = render(<VideoArtifactDetail {...withPreview} />);
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("src")).toBe(withPreview.urls.preview);
  });

  it("keeps the host UX: controls, preload=metadata, no autoplay, aria-label", () => {
    const { container } = render(<VideoArtifactDetail {...withPreview} />);
    const video = container.querySelector("video");
    expect(video?.hasAttribute("controls")).toBe(true);
    expect(video?.getAttribute("preload")).toBe("metadata");
    // No autoplay — playback is always user-initiated.
    expect(video?.hasAttribute("autoplay")).toBe(false);
    expect(video?.getAttribute("aria-label")).toBe("Video preview");
  });

  it("ships no <track> sidecar (an artifact is a single blob)", () => {
    const { container } = render(<VideoArtifactDetail {...withPreview} />);
    expect(container.querySelector("track")).toBeNull();
  });

  it("wraps the player in the shared soft-panel card chrome", () => {
    const { container } = render(<VideoArtifactDetail {...withPreview} />);
    const article = container.querySelector("article");
    expect(article?.className).toContain("soft-panel");
    expect(article?.className).toContain("rounded-card");
  });

  it("exposes the component as the default export the host mounts", () => {
    expect(DefaultExport).toBe(VideoArtifactDetail);
  });
});

describe("VideoArtifactDetail — never-blank floor", () => {
  it("renders a download panel (no <video>) when no preview URL is authorized", () => {
    const { container } = render(
      <VideoArtifactDetail
        artifact={{ title: "Old clip", mime: "video/quicktime" }}
        urls={{ preview: null }}
      />,
    );
    expect(container.querySelector("video")).toBeNull();
    expect(container.textContent).toContain("cannot be played inline");
    expect(container.textContent).toContain("video/quicktime");
    expect(container.textContent).toContain("Old clip");
  });

  it("degrades to a non-blank panel on entirely missing props (no throw)", () => {
    const { container } = render(<VideoArtifactDetail />);
    expect(container.querySelector("video")).toBeNull();
    expect(container.textContent?.length ?? 0).toBeGreaterThan(0);
    expect(container.textContent).toContain("cannot be played inline");
  });

  it("degrades to a non-blank panel on a malformed snapshot (no throw)", () => {
    const malformed = { artifact: null, urls: null } as Partial<VideoArtifactDetailProps>;
    const { container } = render(<VideoArtifactDetail {...malformed} />);
    expect(container.querySelector("video")).toBeNull();
    expect(container.textContent?.length ?? 0).toBeGreaterThan(0);
  });
});

describe("VideoArtifactDetail — the byte road (props version 2)", () => {
  const ISLAND = "/api/lifecycle-views/artifact-bytes?bc=sealed-preview";
  const SESSION = "/api/artifacts/abc/versions/v1/preview";

  it("plays the byte reference and never the cookie-gated session route", () => {
    const { container } = render(
      <VideoArtifactDetail
        propsApiVersion={2}
        artifact={{ title: "Launch demo", mime: "video/mp4" }}
        urls={{ preview: SESSION, download: "/dl" }}
        actions={{ download: "/dl" }}
        bytes={{ road: "island", preview: ISLAND, download: null }}
      />,
    );
    const video = container.querySelector("video");
    expect(video?.getAttribute("src")).toBe(ISLAND);
    expect(container.innerHTML).not.toContain(SESSION);
    expect(container.querySelector("article")?.getAttribute("data-byte-road")).toBe(
      "island",
    );
  });

  it("falls back to the session href on an older snapshot that carries no reference", () => {
    const { container } = render(
      <VideoArtifactDetail
        propsApiVersion={1}
        artifact={{ title: "Launch demo", mime: "video/mp4" }}
        urls={{ preview: SESSION, download: "/dl" }}
      />,
    );
    expect(container.querySelector("video")?.getAttribute("src")).toBe(SESSION);
    expect(container.querySelector("article")?.getAttribute("data-byte-road")).toBe(
      "session",
    );
  });

  it("floors typed, never blank, when no road carries a playable address", () => {
    const { container } = render(
      <VideoArtifactDetail
        propsApiVersion={1}
        artifact={{ title: "Old clip", mime: "video/quicktime" }}
        urls={{ preview: null, download: null }}
      />,
    );
    expect(container.querySelector("video")).toBeNull();
    expect(container.textContent).toContain("cannot be played inline");
    expect(container.querySelector("article")?.getAttribute("data-byte-road")).toBe(
      "none",
    );
  });

  it("offers the reference's download address on the floor when one exists", () => {
    const { container } = render(
      <VideoArtifactDetail
        propsApiVersion={2}
        artifact={{ title: "Old clip", mime: "video/quicktime" }}
        urls={{ preview: null, download: null }}
        bytes={{ road: "island", preview: null, download: "/island-dl" }}
      />,
    );
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/island-dl");
  });
});
