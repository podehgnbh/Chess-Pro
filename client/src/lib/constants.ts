/**
 * Constants - الثوابت والإعدادات العامة
 */

export const PIECE_UNICODE = {
  'P-white': '♙',
  'N-white': '♘',
  'B-white': '♗',
  'R-white': '♖',
  'Q-white': '♕',
  'K-white': '♔',
  'P-black': '♟',
  'N-black': '♞',
  'B-black': '♝',
  'R-black': '♜',
  'Q-black': '♛',
  'K-black': '♚',
};

export const PIECE_NAMES = {
  P: 'Pawn',
  N: 'Knight',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King',
};

export const PIECE_NAMES_AR = {
  P: 'جندي',
  N: 'حصان',
  B: 'فيل',
  R: 'رخ',
  Q: 'وزير',
  K: 'ملك',
};

export const BOARD_FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const BOARD_RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const AI_DIFFICULTY_LEVELS = {
  easy: { label: 'سهل', depth: 2 },
  medium: { label: 'متوسط', depth: 3 },
  hard: { label: 'صعب', depth: 4 },
  expert: { label: 'خبير', depth: 5 },
};

export const GAME_MODES = {
  AI: 'ai',
  MULTIPLAYER: 'multiplayer',
  ONLINE: 'online',
};

export const COLORS = {
  light: '#F0D9B5',
  dark: '#B58863',
  highlight: '#BACA44',
  selected: '#7FC97F',
  white: '#FFFFFF',
  black: '#000000',
  gold: '#D4AF37',
  silver: '#C0C0C0',
};

export const THEME = {
  primary: '#1a1a1a',
  secondary: '#D4AF37',
  accent: '#F0D9B5',
  background: '#0D0D0D',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
};
