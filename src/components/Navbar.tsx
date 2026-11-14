import { Fragment } from "react";
import {
  BookOpen,
  Download,
  FileUp,
  GitBranch,
  Menu as MenuIcon,
  Moon,
  PanelRight,
  Sun,
  WandSparkles,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import logo from "../assets/voxalfa.svg";
import { useTheme } from "../context/theme";
import { downloadBlob } from "../lib/download";
import { MenuItem, type MenuItemProps } from "./MenuItem";

interface MenuEntry extends MenuItemProps {
  id: string;
}

function Navbar(props: {
  onPreviewToggle: () => void;
  onFormat: () => void;
  onImport: (text: string) => void;
  source: string;
}) {
  const { mode, toggleMode } = useTheme();

  const downloadSource = () => {
    downloadBlob(props.source, "score.vfa", "text/plain;charset=utf-8");
  };

  const importFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".vfa,text/plain";
    input.onchange = async () => {
      const file = input.files?.[0];

      if (file) {
        props.onImport(await file.text());
      }
    };
    input.click();
  };

  const items: MenuEntry[] = [
    {
      id: "import",
      label: "Import file",
      icon: FileUp,
      onSelect: importFile,
    },
    {
      id: "export",
      label: "Download source (.vfa)",
      icon: Download,
      onSelect: downloadSource,
    },
    {
      id: "format",
      label: "Format document",
      icon: WandSparkles,
      onSelect: props.onFormat,
    },
    {
      id: "theme",
      label: mode === "dark" ? "Light theme" : "Dark theme",
      icon: mode === "dark" ? Sun : Moon,
      onSelect: toggleMode,
    },
    {
      id: "documentation",
      label: "Documentation",
      icon: BookOpen,
      href: "https://voxalfa.github.io/documentation/",
    },
    {
      id: "repository",
      label: "Repository",
      icon: GitBranch,
      href: "https://github.com/voxalfa/playground",
    },
  ];

  return (
    <header className="flex py-3 px-4 gap-3 items-center justify-between border-b border-border bg-surface">
      <img src={logo} alt="Voxalfa" className="h-7 w-7 rounded-md" />

      <span className="font-serif text-xl leading-none tracking-tight text-foreground">
        <span className="text-accent">V</span>oxalfa
      </span>

      <button
        type="button"
        onClick={props.onPreviewToggle}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        className="ml-auto icon-button"
      >
        <PanelRight className="h-4 w-4" />
      </button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="icon-button focus:outline-none"
            aria-label="Menu"
            title="Menu"
          >
            <MenuIcon className="h-4 w-4" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            data-theme={mode}
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
    </header>
  );
}

export { Navbar };
