import { Moon, Sun, PanelRight } from "lucide-react";
import logo from "../assets/voxalfa.svg";
import { useTheme } from "../context/theme";

function Navbar(props: { onPreviewToggle: () => void }) {
  const { mode, toggleMode } = useTheme();
  const Icon = mode === "dark" ? Sun : Moon;

  return (
    <header className="flex h-14 gap-2.5 items-center justify-between border-b border-border bg-surface px-4">
      <img src={logo} alt="Voxalfa" className="h-7 w-7 rounded-md" />

      <span className="font-serif text-xl leading-none tracking-tight text-foreground">
        <span className="text-accent">V</span>oxalfa
      </span>

      <button
        type="button"
        onClick={props.onPreviewToggle}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        className="ml-auto flex items-center justify-center text-muted hover:text-accent"
      >
        <PanelRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={toggleMode}
        title="Toggle theme"
        aria-label="Toggle theme"
        className="flex items-center justify-center text-muted hover:text-accent"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    </header>
  );
}

export { Navbar };
