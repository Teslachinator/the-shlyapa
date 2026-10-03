export function Stage({ children, footer, className = "", style }) {
  return (
    <section className={`screen ${className}`} style={style}>
      <div className="screen-scroll">{children}</div>
      {footer ? <div className="dock">{footer}</div> : null}
    </section>
  );
}
