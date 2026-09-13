"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import Icon from "./Icon";

const variantClasses = {
  primary: "btn",
  secondary: "btn btn-secondary",
  outline: "btn btn-outline",
  ghost: "btn btn-ghost",
  danger: "btn btn-danger",
  link: "btn btn-link",
};

const sizeClasses = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  icon: "btn-icon",
};

export const Button = forwardRef(function Button(
  { asChild, variant = "primary", size = "md", className = "", ...props },
  ref
) {
  const classes = `${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
  if (asChild) {
    return (
      <Slot className={classes} {...props} ref={ref}>
        {props.children}
      </Slot>
    );
  }
  return <button ref={ref} className={classes} {...props} />;
});

export const IconButton = forwardRef(function IconButton(
  { label, variant = "ghost", className = "", children, ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      aria-label={label}
      title={label}
      className={`btn-icon ${className}`.trim()}
      {...props}
    >
      {children}
    </Button>
  );
});

export function IconButtonAsChild({ label, className = "", ...props }) {
  return (
    <Slot
      aria-label={label}
      title={label}
      className={`btn btn-ghost btn-icon ${className}`.trim()}
      {...props}
    >
      {props.children}
    </Slot>
  );
}

export { Icon };

export default Button;