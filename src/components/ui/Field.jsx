export function Field({ label, htmlFor, hint, error, required, className = "", children }) {
  return (
    <div className={`${className}`.trim()}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required && (
            <span className="ml-0.5 text-[var(--danger-color)]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`input ${className}`.trim()} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`input min-h-[96px] resize-y ${className}`.trim()} {...props} />;
}