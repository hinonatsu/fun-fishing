import type { Product } from './catalog';
import type { FishingBuild } from './domain';
import { currentAmazonPrice } from './amazon-prices';

export function productPrice(build: Pick<FishingBuild, 'prices'>, product: Product, now = Date.now()): number | null {
  return build.prices[product.id] ?? currentAmazonPrice(product.amazonPrice, now);
}

const yen = (value: number) => `${value.toLocaleString('ja-JP')}円`;
const date = (value: string) => new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value));

export function productPriceLabel(build: Pick<FishingBuild, 'prices'>, product: Product, now = Date.now()): string {
  const manual = build.prices[product.id];
  if (manual !== undefined) return `${yen(manual)}（手入力）`;
  const row = product.amazonPrice;
  const price = currentAmazonPrice(row, now);
  if (price !== null && row?.fetchedAt) return `${yen(price)}（Amazon・${date(row.fetchedAt)}取得・送料別）`;
  if (row?.status === 'unavailable') return 'Amazonで現在購入できる価格がありません';
  if (row?.price !== null && row?.price !== undefined && row.fetchedAt) {
    return `${row.status === 'ok' ? '最新価格は未確認' : '最新価格の取得に失敗'}。前回${yen(row.price)}（${date(row.fetchedAt)}確認・今回は合計に含めません）`;
  }
  if (row?.status === 'blocked' || row?.status === 'error') return 'Amazon価格を取得できませんでした。購入先で確認';
  return '最新の価格情報がありません。購入先で確認してください';
}
