/* ==========================================================================
   apple-hig-web · components.jsx
   Framework-light React components that emit apple-hig.css classes.
   No external dependencies. Requires tokens.css + apple-hig.css to be loaded.

   Usage:
     import { Button, NavigationBar, TabBar, List, Row, Toggle, Sheet } from "./components.jsx";
   Each component is a thin, accessible wrapper — extend freely.
   ========================================================================== */
import React, { useState, useId } from "react";

const cx = (...a) => a.filter(Boolean).join(" ");

/* ---- Glass surface ------------------------------------------------------- */
export function Glass({ variant, as: Tag = "div", className, ...p }) {
  return <Tag className={cx("glass", variant === "clear" && "glass--clear", className)} {...p} />;
}

/* ---- Button -------------------------------------------------------------- */
// prominence: "filled" | "tinted" | "gray" | "bordered" | "plain" (default plain)
// role: "normal" | "destructive"
// size: "sm" | "md" | "lg"
export function Button({ prominence = "plain", role = "normal", size = "md", className, children, ...p }) {
  return (
    <button
      className={cx(
        "hig-btn",
        prominence !== "plain" && `hig-btn--${prominence}`,
        prominence === "plain" && "hig-btn--plain",
        role === "destructive" && "hig-btn--destructive",
        size === "lg" && "hig-btn--lg",
        size === "sm" && "hig-btn--sm",
        className
      )}
      {...p}
    >
      {children}
    </button>
  );
}

/* ---- Segmented control --------------------------------------------------- */
export function Segmented({ options = [], value, onChange, className }) {
  return (
    <div className={cx("hig-segmented", className)} role="tablist">
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange?.(v)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Toggle (switch) ----------------------------------------------------- */
export function Toggle({ checked, defaultChecked, onChange, ...p }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className="hig-toggle"
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={(e) => onChange?.(e.target.checked)}
      {...p}
    />
  );
}

/* ---- Text field & search ------------------------------------------------- */
export function TextField({ className, ...p }) {
  return <input className={cx("hig-field", className)} {...p} />;
}
export function SearchField({ placeholder = "Search", value, onChange, className }) {
  return (
    <label className={cx("hig-search", className)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input type="search" placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} aria-label={placeholder} />
    </label>
  );
}

/* ---- Navigation bar ------------------------------------------------------ */
export function NavigationBar({ title, large = false, backTitle, onBack, leading, trailing, glass = true }) {
  return (
    <>
      <header className={cx("hig-navbar", glass && "glass")}>
        <div className="hig-navbar-leading">
          {onBack ? (
            <button className="hig-navbar-back" onClick={onBack}>{backTitle || "Back"}</button>
          ) : leading}
        </div>
        {!large && <div className="hig-navbar-title">{title}</div>}
        <div className="hig-navbar-trailing">{trailing}</div>
      </header>
      {large && (
        <div className="hig-large-title-block"><h1>{title}</h1></div>
      )}
    </>
  );
}

/* ---- Tab bar (floating glass) ------------------------------------------- */
// tabs: [{ key, label, icon }]
export function TabBar({ tabs = [], value, onChange, glass = true }) {
  return (
    <nav className={cx("hig-tabbar", glass && "glass")} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          className="hig-tab"
          role="tab"
          aria-selected={value === t.key}
          aria-label={t.label}
          onClick={() => onChange?.(t.key)}
        >
          <span className="hig-tab-icon" aria-hidden="true">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---- Sidebar ------------------------------------------------------------- */
export function Sidebar({ groups = [], value, onChange }) {
  return (
    <aside className="hig-sidebar glass">
      {groups.map((g, i) => (
        <React.Fragment key={i}>
          {g.title && <h3>{g.title}</h3>}
          {g.items.map((it) => (
            <a
              key={it.key}
              className="hig-sidebar-item"
              aria-current={value === it.key ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); onChange?.(it.key); }}
              href="#"
            >
              {it.icon && <span aria-hidden="true">{it.icon}</span>}
              <span>{it.label}</span>
            </a>
          ))}
        </React.Fragment>
      ))}
    </aside>
  );
}

/* ---- List & Row ---------------------------------------------------------- */
export function List({ header, footer, inset = true, children }) {
  return (
    <section>
      {header && <div className="hig-list-header">{header}</div>}
      <ul className={cx("hig-list", inset && "hig-list--inset")}>{children}</ul>
      {footer && <div className="hig-list-footer">{footer}</div>}
    </section>
  );
}
// accessory: "chevron" | "value" | React node
export function Row({ icon, iconColor, title, subtitle, value, accessory, onClick, href }) {
  const Tag = href ? "a" : onClick ? "button" : "li";
  const tappable = !!(href || onClick);
  const inner = (
    <>
      {icon && (
        <span className="hig-row-icon" style={iconColor ? { background: iconColor } : undefined} aria-hidden="true">{icon}</span>
      )}
      <span className="hig-row-text">
        <span className="hig-row-title">{title}</span>
        {subtitle && <span className="hig-row-subtitle">{subtitle}</span>}
      </span>
      {value && <span className="hig-row-value">{value}</span>}
      {accessory === "chevron" && <span className="hig-row-chevron" aria-hidden="true" />}
      {accessory && accessory !== "chevron" && accessory !== "value" && accessory}
    </>
  );
  if (Tag === "li") return <li className="hig-row">{inner}</li>;
  return (
    <li>
      <Tag className={cx("hig-row", tappable && "hig-row--tappable")} href={href} onClick={onClick}>{inner}</Tag>
    </li>
  );
}

/* ---- Card ---------------------------------------------------------------- */
export function Card({ className, children, ...p }) {
  return <div className={cx("hig-card-box", className)} {...p}>{children}</div>;
}

/* ---- Sheet --------------------------------------------------------------- */
export function Sheet({ open, onClose, detent = "large", children }) {
  if (!open) return null;
  return (
    <div className="hig-sheet-backdrop" onClick={onClose}>
      <div
        className={cx("hig-sheet", detent === "medium" && "hig-sheet--medium")}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hig-sheet-grabber" />
        {children}
      </div>
    </div>
  );
}

/* ---- Alert --------------------------------------------------------------- */
// actions: [{ label, role: "default"|"cancel"|"destructive", onClick }]
export function Alert({ open, title, message, actions = [], onClose }) {
  if (!open) return null;
  return (
    <div className="hig-alert-backdrop" role="presentation">
      <div className="hig-alert" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="hig-alert-body">
          <div className="hig-alert-title">{title}</div>
          {message && <div className="hig-alert-msg">{message}</div>}
        </div>
        <div className="hig-alert-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              className={cx(a.role === "default" && "is-default", a.role === "destructive" && "is-destructive")}
              onClick={() => { a.onClick?.(); onClose?.(); }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Action sheet -------------------------------------------------------- */
export function ActionSheet({ open, actions = [], cancelLabel = "Cancel", onClose }) {
  if (!open) return null;
  return (
    <div className="hig-actionsheet-backdrop" onClick={onClose}>
      <div className="hig-actionsheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="hig-actionsheet-group">
          {actions.map((a, i) => (
            <button key={i} className={cx(a.role === "destructive" && "is-destructive")} onClick={() => { a.onClick?.(); onClose?.(); }}>
              {a.label}
            </button>
          ))}
        </div>
        <div className="hig-actionsheet-cancel">
          <button onClick={onClose}>{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ---- Menu ---------------------------------------------------------------- */
// items: [{ label, icon, role, onClick } | "separator"]
export function Menu({ items = [] }) {
  return (
    <div className="hig-menu" role="menu">
      {items.map((it, i) =>
        it === "separator" ? (
          <div className="hig-menu-sep" key={i} />
        ) : (
          <button key={i} role="menuitem" className={cx(it.role === "destructive" && "is-destructive")} onClick={it.onClick}>
            <span>{it.label}</span>
            {it.icon && <span aria-hidden="true">{it.icon}</span>}
          </button>
        )
      )}
    </div>
  );
}

/* ---- Progress, spinner, page control ------------------------------------- */
export function Progress({ value = 0 }) {
  return <div className="hig-progress"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}
export function Spinner({ label = "Loading" }) {
  return <span className="hig-spinner" role="status" aria-label={label} />;
}
export function PageControl({ count = 1, current = 0 }) {
  return (
    <div className="hig-pagecontrol" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className={i === current ? "is-current" : undefined} />
      ))}
    </div>
  );
}

/* ---- Badge / tag --------------------------------------------------------- */
export function Badge({ children }) { return <span className="hig-badge">{children}</span>; }
export function Tag({ children, onRemove }) {
  return (
    <span className="hig-tag">
      {children}
      {onRemove && <button onClick={onRemove} aria-label="Remove" style={{ all: "unset", cursor: "pointer" }}>×</button>}
    </span>
  );
}

export default {
  Glass, Button, Segmented, Toggle, TextField, SearchField, NavigationBar, TabBar,
  Sidebar, List, Row, Card, Sheet, Alert, ActionSheet, Menu, Progress, Spinner,
  PageControl, Badge, Tag,
};
