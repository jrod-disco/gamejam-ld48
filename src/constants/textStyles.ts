import * as PIXI from 'pixi.js';
import { THEME } from './';
import { APP_WIDTH } from './';

// Text
export const TEXT_STYLE = {
  GRADIENT_PROMPT: new PIXI.TextStyle({
    fontFamily: 'Roboto, sans-serif',
    fontSize: 16,
    fill: [THEME.TXT_INFO_HEX],
    // fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
    //fillGradientStops: [0.01, 1],
    dropShadow: true,
    dropShadowColor: THEME.BG_HEX,
    dropShadowBlur: 5,
    dropShadowDistance: 4,
    align: 'center',
    wordWrap: true,
    wordWrapWidth: APP_WIDTH * 0.8,
  }),

  TITLE_WHITE: new PIXI.TextStyle({
    fontFamily: 'Impact, Charcoal, sans-serif',
    fontSize: 42,
    fill: THEME.TXT_TITLES_HEX,
    align: 'center',
  }),

  SCREEN_TITLE: new PIXI.TextStyle({
    fontFamily: 'Roboto, sans-serif',
    fontSize: 28,
    fontWeight: 'bold',
    fill: [0xc7a105],
    dropShadow: true,
    dropShadowColor: THEME.BG_HEX,
    dropShadowBlur: 5,
    dropShadowDistance: 4,
    align: 'center',
    wordWrap: true,
    wordWrapWidth: APP_WIDTH * 0.9,
  }),

  SCREEN_BODY: new PIXI.TextStyle({
    fontFamily: 'Roboto, sans-serif',
    fontSize: 16,
    fill: [THEME.TXT_INFO_HEX],
    align: 'center',
    wordWrap: true,
    wordWrapWidth: APP_WIDTH * 0.8,
  }),

  SCREEN_BODY_ALT: new PIXI.TextStyle({
    fontFamily: 'Roboto, sans-serif',
    fontSize: 21,
    fill: [THEME.TXT_INFO_HEX],
    align: 'center',
    wordWrap: true,
    wordWrapWidth: APP_WIDTH * 0.8,
  }),
};
