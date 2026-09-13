"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;

export function TabsTrigger({ className = "", children, ...props }) {
  return (
    <TabsPrimitive.Trigger className={`tab-trigger ${className}`.trim()} {...props}>
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className = "", children, ...props }) {
  return (
    <TabsPrimitive.Content className={`tab-content ${className}`.trim()} {...props}>
      {children}
    </TabsPrimitive.Content>
  );
}