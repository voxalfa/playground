import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Play,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { renderScoreSvg, type SvgRenderResult } from "../lib/svg";
import { useDiagnostics, type PreviewError } from "../hooks/diagnostics";
import { PreviewErrorView } from "./PreviewErrorView";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;

function Preview(props: {
  editorText: string;
  wasmLoaded: boolean;
  apiReady: boolean;
}) {
  const { errors } = useDiagnostics(props.apiReady, props.editorText);
  console.log(errors);
  const [result, setResult] = useState<SvgRenderResult | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!props.wasmLoaded) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setResult(renderScoreSvg(props.editorText));
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [props.editorText, props.wasmLoaded]);

  const error = result?.status === "error" ? result.message : null;
  const pageCount = result?.status === "ok" ? result.pages.length : 0;
  const page = Math.min(currentPage, Math.max(pageCount - 1, 0));

  useEffect(() => {
    if (svgRef.current !== null && result?.status === "ok") {
      svgRef.current.innerHTML = result.pages[page] ?? "";
    }
  }, [result, page]);

  const isRendering = props.wasmLoaded && result === null;
  const problems: PreviewError[] =
    error !== null ? [{ message: error }] : errors;

  return (
    <aside className="flex h-full w-[40%] shrink-0 flex-col border-l border-border bg-surface max-md:absolute max-md:inset-0 max-md:z-20 max-md:w-full">
      <div className="min-h-0 flex-1 overflow-auto">
        {!props.wasmLoaded || isRendering ? (
          <div
            key="loading"
            className="flex h-full flex-col items-center justify-center gap-3"
          >
            <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
            <p className="text-xs text-muted">
              {props.wasmLoaded ? "Rendering score…" : "Loading renderer…"}
            </p>
          </div>
        ) : problems.length > 0 ? (
          <PreviewErrorView
            key="error"
            title={
              error !== null
                ? "Unable to render the score"
                : "The score has errors"
            }
            errors={problems}
          />
        ) : pageCount === 0 ? (
          <div
            key="empty"
            className="flex h-full items-center justify-center px-6 text-center text-xs text-muted"
          >
            Nothing to preview yet.
          </div>
        ) : (
          <div
            key="svg"
            className="svg-preview mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
            ref={svgRef}
            style={{ width: `${zoom * 100}%` }}
          />
        )}
      </div>

      <div className="flex h-10 shrink-0 items-center gap-1 border-t border-border px-2">
        <button
          type="button"
          className="icon-button"
          disabled={page === 0}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="min-w-12 text-center text-xs tabular-nums text-muted">
          {pageCount > 0 ? `${page + 1} / ${pageCount}` : "0 / 0"}
        </span>

        <button
          type="button"
          className="icon-button"
          disabled={pageCount <= 1 || page >= pageCount - 1}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="icon-button"
            disabled={zoom <= ZOOM_MIN}
            onClick={() =>
              setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN))
            }
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="min-w-10 text-center text-xs tabular-nums text-muted">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            className="icon-button"
            disabled={zoom >= ZOOM_MAX}
            onClick={() =>
              setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX))
            }
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="icon-button"
            aria-label="Play"
            disabled
          >
            <Play className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Preview;
