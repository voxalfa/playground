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
import * as Slider from "@radix-ui/react-slider";
import type { PreviewError } from "../editor/diagnostics";
import { usePlayback } from "../hooks/usePlayback";
import { PreviewErrorView } from "./PreviewErrorView";
import { DownloadMenu } from "./DownloadMenu";
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
  errors: PreviewError[];
  diagnosticsReady: boolean;
  wasmLoaded: boolean;
}) {
  const errors = props.errors;
  const [svgPages, setSvgPages] = useState<string[] | null>(null);
  const [midi, setMidi] = useState<Uint8Array | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const playback = usePlayback(midi);
  const svgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!props.wasmLoaded || !props.diagnosticsReady || errors.length) {
      return;
    }

    const timeout = window.setTimeout(() => {
      try {
        setSvgPages(renderSVG(props.editorText).map(sanitizeSvg));
        setMidi(createMIDI(props.editorText));
      } catch (error) {
        console.error("Failed to render score", error);
        setSvgPages([]);
        setMidi(null);
      }
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [
    props.editorText,
    props.wasmLoaded,
    props.diagnosticsReady,
    errors.length,
  ]);

  const pageCount = svgPages?.length ?? 0;
  const page = Math.min(currentPage, Math.max(pageCount - 1, 0));

  useEffect(() => {
    if (svgRef.current !== null && svgPages) {
      svgRef.current.innerHTML = svgPages[page] ?? "";
    }
  }, [svgPages, page]);

  const isWaitingForDiagnostics =
    props.wasmLoaded && !props.diagnosticsReady && svgPages === null;
  const isRendering =
    props.wasmLoaded &&
    props.diagnosticsReady &&
    errors.length === 0 &&
    svgPages === null;

  return (
    <aside className="flex h-full w-[40%] shrink-0 flex-col border-l border-border bg-surface max-md:absolute max-md:inset-0 max-md:z-20 max-md:w-full">
      <div className="min-h-0 flex-1 overflow-auto">
        {!props.wasmLoaded || isWaitingForDiagnostics || isRendering ? (
          <div
            key="loading"
            className="flex h-full flex-col items-center justify-center gap-3"
          >
            <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
            <p className="text-xs text-muted">
              {!props.wasmLoaded
                ? "Loading modules…"
                : isWaitingForDiagnostics
                  ? "Checking score…"
                  : "Rendering score…"}
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

      <div className="flex h-auto shrink-0 flex-col gap-1 border-t border-border px-2 py-1 sm:h-10 sm:flex-row sm:items-center sm:gap-2 sm:py-0">
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-1">
          <Slider.Root
            className="relative flex h-10 min-w-0 flex-1 items-center data-[disabled]:opacity-40 sm:h-4"
            min={0}
            max={Math.max(playback.duration, 0.01)}
            step={0.1}
            value={[Math.min(playback.position, playback.duration)]}
            onValueChange={([value]) => playback.seek(value)}
            disabled={playback.duration === 0}
          >
            <Slider.Track className="relative h-1 grow rounded-full bg-border">
              <Slider.Range className="absolute h-full rounded-full bg-accent" />
            </Slider.Track>
            <Slider.Thumb
              aria-label="Seek"
              className="relative block h-3 w-3 rounded-full bg-accent before:absolute before:-inset-3 before:content-[''] sm:before:-inset-2"
            />
          </Slider.Root>

          <button
            type="button"
            className="icon-button shrink-0"
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

          <span className="shrink-0 text-xs tabular-nums text-muted">
            {formatTime(playback.position)} / {formatTime(playback.duration)}
          </span>
        </div>

        <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
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
          </div>

          <DownloadMenu midi={midi} svgPages={svgPages} page={page} />
        </div>
      </div>
    </aside>
  );
}

function sanitizeSvg(svg: string): string {
  return svg.replace("svg {", ".svg-preview svg {");
}

export default Preview;
