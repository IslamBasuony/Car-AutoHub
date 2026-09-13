export function Card({ as: Tag = "div", hover = false, className = "", children, ...props }) {
  return (
    <Tag
      className={`card ${hover ? "card-hover" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`px-5 pt-5 pb-0 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={`font-semibold tracking-tight text-[var(--text-primary)] ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <p className={`text-sm text-[var(--text-secondary)] ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div className={`px-5 pb-5 pt-0 mt-auto ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}