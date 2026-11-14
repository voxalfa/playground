import type { LucideIcon } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface MenuItemProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
}

function MenuItem({
  label,
  icon: Icon,
  href,
  onSelect,
  disabled,
}: MenuItemProps) {
  const content = (
    <>
      <Icon className="size-4" />
      <span>{label}</span>
    </>
  );
  const classes =
    "flex cursor-default items-center gap-2 whitespace-nowrap px-3 py-2.5 text-xs text-foreground outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-background";

  if (href) {
    return (
      <DropdownMenu.Item asChild>
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={classes}
        >
          {content}
        </a>
      </DropdownMenu.Item>
    );
  }

  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={classes}
    >
      {content}
    </DropdownMenu.Item>
  );
}

export { MenuItem, type MenuItemProps };
