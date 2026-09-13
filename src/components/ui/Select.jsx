"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import Icon from "./Icon";

export const SelectRoot = SelectPrimitive.Root;

export function SelectItem({ value, children }) {
  return (
    <SelectPrimitive.Item value={value} className="select-item">
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="flex items-center">
        <Icon name="check" size={14} strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export default function Select({
  items,
  value,
  onValueChange,
  placeholder = "Select…",
  label,
  id,
  name,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <SelectRoot value={value} onValueChange={onValueChange} name={name} disabled={disabled} {...props}>
      <SelectPrimitive.Trigger id={id} aria-label={label} className={`select-trigger ${className}`.trim()}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          <Icon name="chevron-down" size={16} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="select-content" position="popper" sideOffset={4}>
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-[var(--text-muted)]">
            <Icon name="chevron-down" size={14} className="rotate-180" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="select-viewport">
            {items.map((item, i) => {
              const isObj = typeof item === "object" && item !== null;
              const val = isObj ? item.value : item;
              const lbl = isObj ? item.label : item;
              return (
                <SelectItem key={val} value={val}>
                  {lbl}
                </SelectItem>
              );
            })}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-[var(--text-muted)]">
            <Icon name="chevron-down" size={14} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectRoot>
  );
}