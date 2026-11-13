import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pause,
  Play,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDiagnostics } from "../hooks/useDiagnostics";
import { usePlayback } from "../hooks/usePlayback";
import { PreviewErrorView } from "./PreviewErrorView";
import { createMIDI, renderSVG } from "voxalfa-lib";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function Preview(props: {
  editorText: string;
  wasmLoaded: boolean;
  apiReady: boolean;
}) {
  const { errors } = useDiagnostics(props.apiReady, props.editorText);
  const [svgPages, setSvgPages] = useState<string[] | null>(null);
  const [midi, setMidi] = useState<Uint8Array | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const playback = usePlayback(midi);
  const svgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!props.wasmLoaded || errors.length) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSvgPages(renderSVG(props.editorText).map(sanitizeSvg));
      setMidi(createMIDI(props.editorText));
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [props.editorText, props.wasmLoaded, errors.length]);

  const pageCount = svgPages?.length ?? 0;
  const page = Math.min(currentPage, Math.max(pageCount - 1, 0));

  useEffect(() => {
    if (svgRef.current !== null && svgPages) {
      svgRef.current.innerHTML = svgPages[page] ?? "";
    }
  }, [svgPages, page]);

  const isRendering = props.wasmLoaded && svgPages === null;

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
              {props.wasmLoaded ? "Rendering score…" : "Loading modules…"}
            </p>
          </div>
        ) : errors.length > 0 ? (
          <PreviewErrorView
            key="error"
            title={"The score has errors"}
            errors={errors}
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

      <div className="flex h-10 shrink-0 items-center gap-2 border-t border-border px-2">
        <div className="flex items-center gap-1">
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
        </div>

        <input
          type="range"
          min={0}
          max={playback.duration}
          step={0.1}
          value={Math.min(playback.position, playback.duration)}
          onChange={(event) => playback.seek(Number(event.target.value))}
          disabled={playback.duration === 0}
          aria-label="Seek"
          className="h-1 min-w-0 flex-1 accent-accent disabled:opacity-40"
        />

        <span className="shrink-0 text-[11px] tabular-nums text-muted">
          {formatTime(playback.position)} / {formatTime(playback.duration)}
        </span>

        <div className="flex items-center gap-1">
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
            aria-label={playback.playing ? "Pause" : "Play"}
            disabled={playback.duration === 0}
            onClick={() => void playback.toggle()}
          >
            {playback.playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

function sanitizeSvg(svg: string): string {
  return svg.replace("svg {", ".svg-preview svg {");
}

export default Preview;
