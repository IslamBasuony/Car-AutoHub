"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import Icon from "./Icon";
import { Button } from "./Button";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogContent({
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmTone = "danger",
  icon = "alert",
  onConfirm,
  className = "",
  children,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="dialog-overlay" />
      <AlertDialogPrimitive.Content
        className={`dialog-content dialog-content-sm ${className}`.trim()}
        {...props}
      >
        <div className="dialog-body pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-color)]">
              <Icon name={icon} size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialogPrimitive.Title className="dialog-title">{title}</AlertDialogPrimitive.Title>
              {description ? (
                <AlertDialogPrimitive.Description className="dialog-description">
                  {description}
                </AlertDialogPrimitive.Description>
              ) : null}
            </div>
          </div>
          {children}
        </div>
        <div className="dialog-footer">
          <AlertDialogPrimitive.Cancel asChild>
            <Button variant="outline">{cancelLabel}</Button>
          </AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action asChild>
            <Button variant={confirmTone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </AlertDialogPrimitive.Action>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}