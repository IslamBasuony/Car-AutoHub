"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Icon from "./Icon";
import { IconButton } from "./Button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  title,
  description,
  size = "md",
  hideClose = false,
  footer,
  className = "",
  ...props
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content
        className={`dialog-content dialog-content-${size} ${className}`.trim()}
        {...props}
      >
        <div className="dialog-header">
          {title ? (
            <div className="min-w-0 pr-6 flex-1">
              <DialogPrimitive.Title className="dialog-title">{title}</DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="dialog-description">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          ) : null}
          {!hideClose && (
            <DialogPrimitive.Close asChild>
              <IconButton label="Close" className="shrink-0 -mr-1">
                <Icon name="x" size={16} />
              </IconButton>
            </DialogPrimitive.Close>
          )}
        </div>
        <div className="dialog-body">{children}</div>
        {footer ? <div className="dialog-footer">{footer}</div> : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}