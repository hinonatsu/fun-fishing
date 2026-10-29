import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ExternalLink, Info, X } from "lucide-react";
import { safeExternalUrl, type CompatibilityResult } from "./domain";

export function ExternalLinkButton({ href, children, className = "" }: { href?: string; children: ReactNode; className?: string }) {
  const safe = href ? safeExternalUrl(href) : null;
  return safe ? <a className={`external-link ${className}`} href={safe} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={14} aria-hidden="true" /><span className="sr-only">（新しいタブで開く）</span></a> : <span className="muted small">購入先を未確認</span>;
}

export function Modal({ title, children, onClose, className = "" }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close(); document.body.style.overflow = previous;
      if (opener?.isConnected && opener.getClientRects().length) opener.focus();
      else {
        const menu = document.querySelector<HTMLElement>(".mobile-menu");
        if (menu?.getClientRects().length) menu.focus();
        else document.querySelector<HTMLElement>("main h1")?.focus();
      }
    };
  }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={id} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose(); } }}>
    <div className="modal-heading"><div><p className="eyebrow">FUN FISHING GUIDE</p><h2 id={id}>{title}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="閉じる"><X size={22} /></button></div>
    {children}
  </dialog>;
}

export type Choice = { value: string; label: string; note?: string; group?: string };
export function SearchSelect({ label, icon, value, choices, onChange, grid = false }: { label: string; icon: ReactNode; value: string; choices: Choice[]; onChange: (value: string) => void; grid?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    const closeOutside = (e: PointerEvent) => { if (e.target instanceof Node && !ref.current?.contains(e.target)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="search-field" ref={ref} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls={id} className={`search-trigger ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)}><span className="field-icon">{icon}</span><span className="field-content"><span className="field-label">{label}</span><span className="field-value">{choices.find(c => c.value === value)?.label || "選択してください"}</span></span><ChevronDown size={16} aria-hidden="true" /></button>
    {open && <div id={id} className={`search-popover ${grid ? "month-popover" : ""}`} role="group" aria-label={`${label}を選択`} onKeyDown={e => {
      const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const direction = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (direction) { e.preventDefault(); buttons[(index + direction + buttons.length) % buttons.length]?.focus(); }
      if (e.key === "Home" || e.key === "End") { e.preventDefault(); buttons[e.key === "Home" ? 0 : buttons.length - 1]?.focus(); }
    }}><p className="popover-title">{label}を選択</p><div className={grid ? "month-grid" : "choice-list"}>{choices.map(c => <button type="button" key={c.value} aria-pressed={value === c.value} className="choice" onClick={() => { onChange(c.value); setOpen(false); trigger.current?.focus(); }}><span>{c.group && <span className="choice-group">{c.group}</span>}<span>{c.label}</span>{c.note && <small>{c.note}</small>}</span>{value === c.value && <Check size={15} aria-hidden="true" />}</button>)}</div></div>}
  </div>;
}

export function CompatibilityBadge({ status }: { status: CompatibilityResult["status"] }) {
  return <span className={`status-badge ${status}`}>{status === "recommended" ? <Check size={13} /> : <Info size={13} />} {status === "recommended" ? "推奨" : status === "avoid" ? "非推奨" : "要確認"}</span>;
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return <div className={`notice ${tone}`}><Info size={18} aria-hidden="true" /><div>{children}</div></div>;
}
