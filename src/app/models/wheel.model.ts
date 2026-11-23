export interface WheelItem {
  id: string;
  text: string;
  color: string;
  textColor?: string;
  active: boolean;
}

export interface DrawHistoryItem {
  id: string;
  text: string;
  color: string;
  timestamp: Date;
  excluded: boolean;
}

export interface WheelConfig {
  title: string;
  items: { text: string; color?: string; active?: boolean }[];
  autoExclude: boolean;
  force: number;
}

export interface ForcePreset {
  label: string;
  description: string;
  value: number;
  duration: number; // estimated seconds
  baseRounds: number;
  icon: string;
}

export const FORCE_PRESETS: ForcePreset[] = [
  { label: 'Leggero', description: 'Giro breve e soft', value: 1, duration: 3.5, baseRounds: 4, icon: '🍃' },
  { label: 'Normale', description: 'Giro standard da fiera', value: 2, duration: 5.5, baseRounds: 7, icon: '🎯' },
  { label: 'Energico', description: 'Tensione e suspense prolungata', value: 3, duration: 8.0, baseRounds: 11, icon: '⚡' },
  { label: 'Jackpot', description: 'Super giro in stile Las Vegas', value: 4, duration: 11.0, baseRounds: 16, icon: '🎰' },
  { label: 'Turbo Max', description: 'Massima potenza e adrenalina', value: 5, duration: 14.0, baseRounds: 22, icon: '🔥' },
];

export const CASINO_COLORS = [
  '#E63946', // Ruby Red
  '#2A9D8F', // Emerald Teal
  '#E76F51', // Coral Flame
  '#457B9D', // Sapphire Blue
  '#F4A261', // Gold Ochre
  '#9B5DE5', // Amethyst Purple
  '#00BBF9', // Electric Cyan
  '#F15BB5', // Hot Vegas Pink
  '#00F5D4', // Mint Turquoise
  '#FFB703', // Royal Gold
  '#FB8500', // Neon Orange
  '#7209B7', // Deep Violet
];
