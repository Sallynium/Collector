/**
 * GitHub Pages 部署在子路徑（如 /Collector）時，
 * 資料裡存的 repo 相對路徑（/collection/...）需要補上 basePath 前綴。
 * 本機 dev 與舊 Supabase 絕對網址不受影響。
 */
export function asset(url: string): string;
export function asset(url: string | null): string | null;
export function asset(url: string | null): string | null {
  if (!url || !url.startsWith("/")) return url;
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + url;
}
