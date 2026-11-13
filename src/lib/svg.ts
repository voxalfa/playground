import { renderSVG } from "voxalfa-lib";

export type SvgRenderResult =
  | { status: "ok"; pages: string[] }
  | { status: "error"; message: string };

function sanitizeSvg(svg: string): string {
  return svg.replace("svg {", ".svg-preview svg {");
}

function renderScoreSvg(source: string): SvgRenderResult {
  try {
    return { status: "ok", pages: renderSVG(source).map(sanitizeSvg) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return { status: "error", message };
  }
}

export { renderScoreSvg };
