// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The authoritative, zero-dependency author-facing gate shipped in this repo.
import { validateArtifactPackageShape } from "../extension-kind-gate.mjs";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as {
  name: string;
  cinatra: {
    kind: string;
    apiVersion: string;
    displayName: string;
    vendor: { key: string; name: string };
    artifact: {
      accepts: { file: { mimeTypes: string[] } };
      ui: {
        abiVersion: number;
        sdkAbiRange: string;
        renderers: Record<
          string,
          { entry: string; propsApiVersion: number; representations?: string[] }
        >;
      };
    };
  };
};

describe("video-artifact manifest — authoritative kind-gate", () => {
  it("passes the shipped artifact kind-gate with zero errors", () => {
    expect(validateArtifactPackageShape(pkg)).toEqual([]);
  });

  it("is a first-party artifact named per the kind-at-end convention", () => {
    expect(pkg.name).toBe("@cinatra-ai/video-artifact");
    expect(pkg.cinatra.kind).toBe("artifact");
    expect(pkg.cinatra.apiVersion).toBe("cinatra.ai/v1");
  });

  it("declares the Cinatra vendor identity + display name", () => {
    expect(pkg.cinatra.displayName).toBe("Video");
    expect(pkg.cinatra.vendor).toEqual({ key: "cinatra-ai", name: "Cinatra" });
  });

  it("accepts exactly the inline-playable video containers", () => {
    expect(pkg.cinatra.artifact.accepts.file.mimeTypes).toEqual([
      "video/mp4",
      "video/webm",
      "video/ogg",
    ]);
  });
});

describe("video-artifact ui renderer block — strict v1 contract", () => {
  const ui = pkg.cinatra.artifact.ui;

  it("is a v1 ui block with the generated SDK ABI range", () => {
    expect(ui.abiVersion).toBe(1);
    expect(ui.sdkAbiRange).toBe("^2.4.0");
  });

  it("declares only the detail slot (a non-empty partial over detail/preview)", () => {
    expect(Object.keys(ui.renderers)).toEqual(["detail"]);
  });

  it("claims EXACTLY video/* and nothing else", () => {
    expect(ui.renderers.detail.representations).toEqual(["video/*"]);
  });

  it("points at a package-contained renderer entry that exists on disk", () => {
    expect(ui.renderers.detail.entry).toBe("./src/renderers/detail.tsx");
    expect(ui.renderers.detail.propsApiVersion).toBe(1);
    const entryAbs = fileURLToPath(
      new URL(`../${ui.renderers.detail.entry.slice(2)}`, import.meta.url),
    );
    expect(existsSync(entryAbs)).toBe(true);
  });
});
