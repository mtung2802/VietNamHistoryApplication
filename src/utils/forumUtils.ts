import { SessionUser } from '@/services/userSession';

interface TimestampShape {
  seconds?: number;
  nanoseconds?: number;
  toDate?: () => Date;
}

export interface ForumAuthor {
  id: string;
  name: string;
  photo?: string;
}

export const toForumDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'object') {
    const timestamp = value as TimestampShape;
    if (typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
  }

  return null;
};

export const formatForumTime = (value: unknown): string => {
  const date = toForumDate(value);
  if (!date) return 'Vừa xong';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return 'Vừa xong';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} phút trước`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} giờ trước`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} ngày trước`;

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date);
};

export const resolveForumAuthor = (user: SessionUser | null): ForumAuthor | null => {
  if (!user) return null;

  const id =
    (typeof user.id === 'string' && user.id) ||
    (typeof user.uid === 'string' && user.uid) ||
    '';
  if (!id) return null;

  const photo = user.avatar || user.photo;
  return {
    id,
    name: user.name || user.displayName || user.username || 'Người dùng',
    photo: photo && !photo.startsWith('data:') ? photo : undefined,
  };
};
