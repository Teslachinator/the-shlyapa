export function Stage({ children, footer, corner, className = "", style }) {
  const classes = ["screen", corner ? "has-corner" : "", className].filter(Boolean).join(" ");
  return (
    <section className={classes} style={style}>
      {corner ? <div className="screen-corner">{corner}</div> : null}
      <div className="screen-scroll">{children}</div>
      {footer ? <div className="dock">{footer}</div> : null}
    </section>
  );
}
