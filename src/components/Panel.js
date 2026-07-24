export function Panel({ children, style, className = "" }) {
  return (
    <div className={`panel ${className}`} style={style}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      {children}
    </div>
  );
}
