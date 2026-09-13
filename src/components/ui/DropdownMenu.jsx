"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({ className = "", align = "end", sideOffset = 6, children, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={`menu-content ${className}`.trim()}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className = "", danger = false, children, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={`menu-item ${danger ? "menu-item-danger" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuLabel({ className = "", children, ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      className={`px-2.5 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] ${className}`.trim()}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
}

export function DropdownMenuSeparator({ className = "" }) {
  return <DropdownMenuPrimitive.Separator className={`menu-separator ${className}`.trim()} />;
}