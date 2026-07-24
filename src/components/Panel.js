export function Panel({ children, style, className = "" }) {
  return (
    <div className={`panel ${className}`} style={style}>
      {children}
    </div>
  );
}
