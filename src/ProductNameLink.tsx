import { ExternalLink } from 'lucide-react';
import type { Product } from './catalog';
import { safeExternalUrl } from './domain';
import './product-name-link.css';

export function ProductNameLink({ product }: { product?: Pick<Product, 'name' | 'purchaseUrl'> }) {
  if (!product) return null;
  const href = product.purchaseUrl ? safeExternalUrl(product.purchaseUrl) : null;
  return href ? <a className="product-name-link" href={href} target="_blank" rel="noopener noreferrer" title="Amazonの商品ページを新しいタブで開く">{product.name}<ExternalLink size={14} aria-hidden="true" /></a> : <>{product.name}</>;
}
