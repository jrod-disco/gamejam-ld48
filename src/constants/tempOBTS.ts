import { _THEMES } from './themes';

// Gameplay Mode Options
export enum GAME_MODES {
  DEFAULT,
  STORY,
  CUSTOM,
}
export const GAME_MODE_STRING = [
  'ORIGINAL FLAVOR',
  'STORY TIME',
  'CUSTOM GAME',
];

// Environment
export const IS_SCORE_INCREMENTY = true;

// Theming (temp)
// Note Colors are handled in theme.ts
export const THEME = _THEMES.GAMEBOYTRUSE;

// Maths
export const THREESIXTY_RAD = 6.28319;
export const ONEEIGHTY_RAD = 3.14159;
