"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import Icon from "./Icon";

export default function Switch({ checked, onCheckedChange, label = "Toggle theme" }) {
  return (
    <SwitchPrimitive.Root className="switch-root" checked={checked} onCheckedChange={onCheckedChange} aria-label={label}>
      <SwitchPrimitive.Thumb className="switch-thumb">
        <Icon name={checked ? "moon" : "sun"} size={11} strokeWidth={2.5} />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}