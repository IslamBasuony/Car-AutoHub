const tones = {
  brand: "badge-brand",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  neutral: "badge-neutral",
};

export default function Badge({ tone = "brand", dot = true, className = "", children, ...props }) {
  return (
    <span
      className={`badge ${tones[tone]} ${dot ? "" : "badge-plain"} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}