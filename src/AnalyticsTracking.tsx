import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import type { Product } from './catalog';
import { analyticsUrl, productParameters, sendAnalyticsEvent, type AnalyticsEvent, type AnalyticsParameters } from './analytics';

const AnalyticsContext = createContext<AnalyticsParameters>({});

export function AnalyticsProvider({ screen, fishId, methodId, children }: { screen: string; fishId: string; methodId: string; children: ReactNode }) {
  const previous = useRef<{ screen: string; url: string } | null>(null);
  const context = { screen_id: screen, fish_id: fishId || 'unselected', method_id: methodId || 'unselected' };
  useEffect(() => {
    if (previous.current?.screen === screen) return;
    const url = analyticsUrl(location.href, screen);
    sendAnalyticsEvent('page_view', {
      screen_id: screen,
      page_location: url,
      page_title: `${document.title} | ${screen}`,
      page_referrer: previous.current?.url || (document.referrer ? analyticsUrl(document.referrer) : ''),
    });
    sendAnalyticsEvent('flow_step_view', { screen_id: screen, fish_id: fishId || 'unselected', method_id: methodId || 'unselected' });
    previous.current = { screen, url };
  }, [screen, fishId, methodId]);
  return <AnalyticsContext.Provider value={context}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  return (event: AnalyticsEvent, parameters: AnalyticsParameters = {}) => sendAnalyticsEvent(event, { ...context, ...parameters });
}

/** One impression per product/placement/visit after 50% is visible for one second. */
export function ProductImpression({ product, position, className, children }: { product?: Product; position: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(new Set<string>());
  const { screen_id, fish_id, method_id } = useContext(AnalyticsContext);
  useEffect(() => {
    const key = `${screen_id}:${fish_id}:${method_id}:${product?.id}:${position}`;
    if (!product || seen.current.has(key) || !ref.current || typeof IntersectionObserver === 'undefined') return;
    let visible = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => { clearTimeout(timer); timer = undefined; };
    const update = () => {
      cancel();
      if (!visible || document.visibilityState !== 'visible' || seen.current.has(key)) return;
      timer = setTimeout(() => {
        seen.current.add(key);
        sendAnalyticsEvent('product_view', { screen_id, fish_id, method_id, ...productParameters(product), link_position: position });
        observer.disconnect();
      }, 1000);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
      update();
    }, { threshold: [0, 0.5] });
    observer.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    return () => { cancel(); observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [product, position, screen_id, fish_id, method_id]);
  return <div ref={ref} className={className}>{children}</div>;
}
