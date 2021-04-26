/**
 * Barrel file for all screen modules
 *
 * Screens are similar to components but speific to layout concerns
 * for a screen/layer of content, usually UI related.
 *
 * Screens are made up of a layout.ts for view concerns (container item placement, etc.)
 * and maybe an index.ts to serve as the controller
 */

// MENU
export { mainMenuLayout, MainMenuLayout } from './main/layout';

// GAME LEVEL
export { gameLayout, GameLayout } from './game/layout';

// LOSE
export { loseLayout, LoseLayout } from './lose/layout';

// Types
import { MainMenuLayout } from './main/layout';
import { GameLayout } from './game/layout';
import { LoseLayout } from './lose/layout';

export type ScreenLayout = MainMenuLayout | GameLayout | LoseLayout;

export enum ScreenName {
  MAIN = 'mainMenu',
  GAME = 'gameScreen',
  LOSE = 'loseScreen',
}

// Screen Controller
import { screenController } from './controller';
export const controller = screenController({});
