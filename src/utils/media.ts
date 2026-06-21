/**
 * Tiện ích xử lý URL media.
 * Port từ ImageLoader.java: chuyển link Google Drive dạng xem
 * (`/d/{id}/`, `open?id=`, `uc?id=`) sang link tải trực tiếp để
 * <Image>/expo-image hiển thị được.
 */

/**
 * Chuẩn hoá URL ảnh. Nếu là link Google Drive → trả về link tải trực tiếp.
 * Các URL khác giữ nguyên.
 */
export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Chỉ xử lý link Google Drive
  if (!trimmed.includes('drive.google.com')) return trimmed;

  const fileId = extractDriveId(trimmed);
  if (!fileId) return trimmed;

  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

type MediaRef = {
  link?: unknown;
  url?: unknown;
  content?: unknown;
};

type WithMediaRefs = {
  coverMediaRef?: unknown;
  images?: unknown;
};

/** Lấy ảnh chính: ưu tiên coverMediaRef, fallback qua images[].link/url. */
export function getPrimaryImageRef(item?: WithMediaRefs | null): string | undefined {
  const cover = normalizeMediaString(item?.coverMediaRef);
  if (cover) return cover;

  if (!Array.isArray(item?.images)) return undefined;

  for (const image of item.images as MediaRef[]) {
    const link = normalizeMediaString(image?.link) ?? normalizeMediaString(image?.url);
    if (link) return link;
  }

  return undefined;
}

function normalizeMediaString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Trích fileId từ các dạng URL Google Drive phổ biến. */
export function extractDriveId(url: string): string | null {
  // dạng /d/{id}/
  const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch?.[1]) return dMatch[1];

  // dạng ?id={id} hoặc &id={id}
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch?.[1]) return idMatch[1];

  return null;
}
