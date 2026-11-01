import type { CategoryId, Product } from './catalog';

export const MEASUREMENT_ID = 'G-PNP61S32H6';
export type AnalyticsParameters = Record<string, string | number | boolean>;
export type AnalyticsEvent = 'page_view' | 'flow_step_view' | 'product_view' | 'amazon_click' | 'confirmation_click';
type Gtag = (...args: ['js', Date] | ['config', string, AnalyticsParameters] | ['event', string, AnalyticsParameters]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const consumables = new Set<CategoryId>(['line','rig','bait','stopper','sinker','leader','swivel','hook','snap','cushion','shock','chum']);
const lures = new Set<CategoryId>(['lure','egi','burakuri']);
const campaignParameters = new Set(['utm_source','utm_medium','utm_campaign','utm_id','utm_term','utm_content','gclid','dclid','gbraid','wbraid']);
let enabled = false;
let debug = false;

export function productGroup(category: CategoryId) {
  return consumables.has(category) ? 'consumable' : lures.has(category) ? 'lure' : 'equipment';
}

export function productParameters(product: Product): AnalyticsParameters {
  return { product_id: product.id, product_name: product.name, product_category: product.category, product_group: productGroup(product.category) };
}

// Shared URLs contain an encoded plan. Only campaign attribution belongs in GA.
export function analyticsUrl(href: string, screen?: string) {
  const url = new URL(href);
  for (const key of [...url.searchParams.keys()]) if (!campaignParameters.has(key)) url.searchParams.delete(key);
  url.hash = screen || '';
  return url.href;
}

export function initializeAnalytics() {
  if (enabled) return;
  debug = new URLSearchParams(location.search).get('analytics_debug') === '1';
  const local = ['localhost','127.0.0.1','::1','[::1]'].includes(location.hostname);
  enabled = (import.meta.env.PROD && !local) || debug;
  if (!enabled) return;
  window.dataLayer = window.dataLayer || [];
  // Preserve the Google tag's documented arguments-object queue format.
  // eslint-disable-next-line prefer-rest-params
  window.gtag = window.gtag || function () { window.dataLayer?.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    page_location: analyticsUrl(location.href),
    page_referrer: document.referrer ? analyticsUrl(document.referrer) : '',
    ...(debug ? { debug_mode: true } : {}),
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function sendAnalyticsEvent(name: AnalyticsEvent, parameters: AnalyticsParameters) {
  if (!enabled) return;
  try {
    const screen = typeof parameters.screen_id === 'string' ? parameters.screen_id : undefined;
    window.gtag?.('event', name, { page_location: analyticsUrl(location.href, screen), ...parameters, send_to: MEASUREMENT_ID, ...(debug ? { debug_mode: true } : {}) });
  } catch {
    // A blocked or unavailable analytics service must never block shopping links.
  }
}
