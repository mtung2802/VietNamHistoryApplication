import { useThemeContext } from '@/contexts/ThemeContext';

export const LIGHT_TIMELINE_COLORS = {
  background: '#F4EBD8',
  paper: '#FDF8EC',
  paperDeep: '#F4EAD2',
  primaryRed: '#82151B',
  deepRed: '#651310',
  gold: '#B49B6B',
  brown: '#7D6D5C',
  text: '#2A201A',
  textMuted: '#7D6D5C',
  line: '#B49B6B',
  border: 'rgba(101,19,16,0.12)',
  tape: 'rgba(180, 155, 107, 0.34)',
  actionText: '#F6E9CF',
} as const;

export const DARK_TIMELINE_COLORS = {
  background: '#1F1714',
  paper: '#2A201A',
  paperDeep: '#34261F',
  primaryRed: '#B23A2B',
  deepRed: '#F6E9CF',
  gold: '#E9C46A',
  brown: '#D6C5AA',
  text: '#F6E9CF',
  textMuted: '#D6C5AA',
  line: '#B49B6B',
  border: 'rgba(180,155,107,0.24)',
  tape: 'rgba(180,155,107,0.32)',
  actionText: '#F6E9CF',
} as const;

export type TimelineColors = {
  [Key in keyof typeof LIGHT_TIMELINE_COLORS]: string;
};

export function useTimelineColors(): TimelineColors {
  const { isDark } = useThemeContext();
  return isDark ? DARK_TIMELINE_COLORS : LIGHT_TIMELINE_COLORS;
}
