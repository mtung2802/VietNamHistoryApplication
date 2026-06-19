/**
 * Utilities for YouTube links.
 * Ported from Java YouTubeUtils: support watch, short, and embed URLs.
 */

const VIDEO_ID_PATTERNS = [
  /[?&]v=([a-zA-Z0-9_-]{6,})/,
  /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
  /embed\/([a-zA-Z0-9_-]{6,})/,
];

export function extractYoutubeId(input?: string | null): string | null {
  const value = input?.trim();
  if (!value) return null;

  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return /^[a-zA-Z0-9_-]{6,}$/.test(value) ? value : null;
}
