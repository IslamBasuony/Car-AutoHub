"use client";

import { createContext, useCallback, useContext, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import Icon from "./Icon";

const ToastContext = createContext(null);

let toastId = 0;

function ToastCard({ toast, onDismiss }) {
  const variant = toast.variant || "default";
  return (
    <ToastPrimitive.Root
      data-variant={variant}
      className="toast-root"
      open={toast.open}
      duration={toast.duration || 3500}
      onOpenChange={(open) => {
        if (!open) onDismiss(toast.id);
      }}
    >
      <span className="toast-icon">
        <Icon name={variant === "danger" ? "alert" : "check"} size={14} strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <ToastPrimitive.Title className="toast-title">{toast.title}</ToastPrimitive.Title>
        {toast.description ? (
          <ToastPrimitive.Description className="toast-description">{toast.description}</ToastPrimitive.Description>
        ) : null}
      </div>
      <ToastPrimitive.Close asChild>
        <button className="toast-close shrink-0" aria-label="Dismiss">
          <Icon name="x" size={14} />
        </button>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = "default", duration = 3500 }) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, title, description, variant, duration, open: true }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={3500}>
        {children}
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
        ))}
        <ToastPrimitive.Viewport className="toast-viewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}