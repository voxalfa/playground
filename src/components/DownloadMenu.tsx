import { Fragment } from "react";
import { Download, FileImage, FileMusic } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useTheme } from "../context/theme";
import { downloadBlob } from "../lib/download";
import { MenuItem } from "./MenuItem";

interface DownloadMenuProps {
  midi: Uint8Array | null;
  svgPages: string[] | null;
  page: number;
}

function DownloadMenu({ midi, svgPages, page }: DownloadMenuProps) {
  const { mode } = useTheme();
  const svg = svgPages?.[page] ?? null;

  const downloadMidi = () => {
    if (midi !== null) {
      downloadBlob(new Uint8Array(midi), "score.mid", "audio/midi");
    }
  };

  const downloadSvg = () => {
    if (svg !== null) {
      downloadBlob(svg, `score-${page + 1}.svg`, "image/svg+xml");
    }
  };

  const items = [
    {
      id: "midi",
      label: "Download MIDI (.mid)",
      icon: FileMusic,
      disabled: midi === null,
      onSelect: downloadMidi,
    },
    {
      id: "svg",
      label: "Download SVG (.svg)",
      icon: FileImage,
      disabled: svg === null,
      onSelect: downloadSvg,
    },
  ];

  return (
    <Tooltip.Provider delayDuration={300}>
      <DropdownMenu.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="icon-button focus:outline-none"
                aria-label="Download"
                disabled={midi === null && svg === null}
              >
                <Download className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
          </Tooltip.Trigger>

          <Tooltip.Portal>
            <Tooltip.Content
              data-theme={mode}
              side="top"
              sideOffset={6}
              className="z-50 bg-foreground px-1.5 py-0.5 text-[10px] text-background"
            >
              Download
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            data-theme={mode}
            side="top"
            align="end"
            sideOffset={6}
            className="z-50 min-w-48 border border-border bg-surface shadow-xs"
          >
            {items.map(({ id, ...item }, index) => (
              <Fragment key={id}>
                <MenuItem {...item} />
                {index < items.length - 1 && (
                  <DropdownMenu.Separator className="border-t border-border" />
                )}
              </Fragment>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </Tooltip.Provider>
  );
}

export { DownloadMenu };
