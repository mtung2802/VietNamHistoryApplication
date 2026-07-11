import { useThemeContext } from '@/contexts/ThemeContext';

export const LIGHT_TIMELINE_COLORS = {
  background: '#F6EFE3',
  paper: '#FFF8EA',
  paperDeep: '#E7D2AE',
  primaryRed: '#B91C1C',
  deepRed: '#7F1D1D',
  gold: '#B8860B',
  brown: '#5C3A21',
  text: '#2F2A24',
  textMuted: '#6B6258',
  line: '#9A6A35',
  border: '#D9C39E',
  tape: 'rgba(218, 193, 143, 0.82)',
  actionText: '#FFF8EA',
} as const;

export const DARK_TIMELINE_COLORS = {
  background: '#171411',
  paper: '#29241F',
  paperDeep: '#40362B',
  primaryRed: '#D85A54',
  deepRed: '#F0C9BF',
  gold: '#D6A84F',
  brown: '#C8A97D',
  text: '#F7F0E6',
  textMuted: '#C9BCAA',
  line: '#B1844D',
  border: '#594C3E',
  tape: 'rgba(158, 126, 78, 0.86)',
  actionText: '#FFF8EA',
} as const;

export type TimelineColors = {
  [Key in keyof typeof LIGHT_TIMELINE_COLORS]: string;
};

export function useTimelineColors(): TimelineColors {
  const { isDark } = useThemeContext();
  return isDark ? DARK_TIMELINE_COLORS : LIGHT_TIMELINE_COLORS;
}
