const YOUTUBE_PATTERNS = [
  /[?&]v=([a-zA-Z0-9_-]{6,})/,
  /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
  /embed\/([a-zA-Z0-9_-]{6,})/,
  /shorts\/([a-zA-Z0-9_-]{6,})/,
];

export function extractYoutubeId(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return /^[a-zA-Z0-9_-]{6,}$/.test(trimmed) ? trimmed : undefined;
}
