import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { RigPart } from './rigs';

/** A pointer-only name label; the existing legend supplies keyboard and screen-reader names. */
export function RigHoverLabel({ parts, diagram }: { parts: RigPart[]; diagram: RefObject<SVGSVGElement | null> }) {
  const [label, setLabel] = useState<{ text: string; x: number; y: number }>();
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let target: Element | null = null;
    let dismissed: Element | null = null;
    let pointer: { x: number; y: number; type: string } | undefined;
    const update = (node: Element | null) => {
      const shape = node?.closest('[data-part], [data-part-label]');
      const cell = node?.closest('.equipment-table [data-category], .tackle-part-list [data-category]');
      const ownShape = shape && diagram.current?.contains(shape) ? shape : null;
      const part = ownShape
        ? parts.find(p => p.id === (ownShape.getAttribute('data-part') || ownShape.getAttribute('data-part-label')))
        : cell ? parts.find(p => p.category === cell.getAttribute('data-category')) : undefined;
      target = part ? ownShape || cell || null : null;
      if (target !== dismissed) dismissed = null;
      if (!pointer || pointer.type === 'touch' || !part || !target || target === dismissed) setLabel(undefined);
      else setLabel({ text: part.label, x: pointer.x, y: pointer.y });
    };
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY, type: event.pointerType };
      update(event.target instanceof Element ? event.target : null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { dismissed = target; setLabel(undefined); }
    };
    const hide = () => { pointer = undefined; target = null; dismissed = null; setLabel(undefined); };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const scroll = () => { if (pointer) update(document.elementFromPoint(pointer.x, pointer.y)); };
    document.addEventListener('pointerover', move, true);
    document.addEventListener('pointermove', move, true);
    document.addEventListener('pointercancel', hide);
    document.addEventListener('pointerout', leave, true);
    document.addEventListener('keydown', escape);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', scroll, true);
    return () => {
      document.removeEventListener('pointerover', move, true);
      document.removeEventListener('pointermove', move, true);
      document.removeEventListener('pointercancel', hide);
      document.removeEventListener('pointerout', leave, true);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('blur', hide);
      window.removeEventListener('scroll', scroll, true);
    };
  }, [parts, diagram]);
  useLayoutEffect(() => {
    const tooltip = element.current;
    if (!label || !tooltip) return;
    const { width, height } = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(8, Math.min(label.x + 12, innerWidth - width - 8))}px`;
    tooltip.style.top = `${label.y + height + 22 > innerHeight ? Math.max(8, label.y - height - 10) : label.y + 14}px`;
  }, [label]);
  return label ? createPortal(<div ref={element} role="tooltip" className="rig-name-tooltip">{label.text}</div>, document.body) : null;
}
