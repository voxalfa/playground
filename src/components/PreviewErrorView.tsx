import { TriangleAlert } from "lucide-react";
import type { PreviewError } from "../editor/diagnostics";

interface PreviewErrorViewProps {
  title: string;
  errors: PreviewError[];
}

function PreviewErrorView({ title, errors }: PreviewErrorViewProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-8">
        <TriangleAlert className="h-6 w-6 shrink-0 text-accent" />

        <div className="w-full max-w-md space-y-3">
          <p className="text-center text-sm font-medium text-foreground">
            {title}
          </p>

          <ul className="space-y-1.5 text-left text-xs leading-relaxed">
            {errors.map((error, index) => (
              <li
                key={`${index}-${error.message}`}
                className="flex items-start gap-2 text-muted"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1 shrink-0 rounded-full bg-muted"
                />

                <span className="min-w-0 flex-1 break-words">
                  {error.message}
                  <span className="font-medium text-foreground">
                    {" "}
                    (Line {error.line}, Column {error.column})
                  </span>
                  <span className="text-accent">
                    {error.code !== undefined && ` [${error.code}]`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export { PreviewErrorView };
