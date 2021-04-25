import * as PIXI from 'pixi.js';
import { THEME } from '@src/constants';

import { PlayerState } from '../../playerCharacter';

export interface Gauges {
  container: PIXI.Container;
  reset: () => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  update: (delta: number, state: PlayerState) => void;
}

interface Props {
  pos?: { x: number; y: number };
}

type GuagesState = {
  isOn: boolean;
  oxygen: number;
  power: number;
  integrity: number;
  structure: number;
};

/**
 * Run Time UI.
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const gauges = (props: Props): Gauges => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();

  container.x = pos.x;
  container.y = pos.y;
  container.name = 'gauges';

  // STATE

  let state: GuagesState = {
    isOn: true,
    oxygen: 0,
    power: 0,
    integrity: 0,
    structure: 0,
  };

  const initialState = { ...state };

  // Display Items
  const oxygenTitle = new PIXI.BitmapText('Oxygen', {
    fontName: `FFFFuego-16`,
    fontSize: 14,
    align: 'left',
  });
  oxygenTitle.anchor.set(0, 0);
  oxygenTitle.tint = THEME.TXT_TITLES_HEX;
  oxygenTitle.alpha = 0.8;

  const oxygen = new PIXI.BitmapText('000', {
    fontName: `FFFFuego-16-bold`,
    fontSize: 13,
    align: 'left',
  });
  oxygen.anchor.set(0, 0);
  oxygen.tint = THEME.TXT_HUD_HEX;
  oxygen.position.y += 18;
  oxygen.position.x += 2;

  // pressure

  // integrity

  container.addChild(oxygenTitle, oxygen);

  const updateState = (playerState: PlayerState) => {
    state.oxygen = playerState.oxygen;
    state.power = playerState.power;
    state.integrity = playerState.integrity;
  };

  const updateCluster = (): void => {
    oxygen.text = state.oxygen.toFixed(2);
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    state = null;
    state = { ...initialState };
    lastUpdateTime = Date.now();
    updateCluster();
  };
  reset();

  let lastUpdateTime = Date.now();

  const start = (): void => {
    lastUpdateTime = Date.now();
    state = { ...state, isOn: true };
  };

  const stop = (): void => {
    state = { ...state, isOn: false };
  };

  const pause = (): void => {
    state = { ...state, isOn: false };
  };

  // UPDATE
  // - expose player / ship state as ui elements
  // - invoked on gameLogic
  const update = (delta, newState: PlayerState): void => {
    if (state.isOn && Date.now() > lastUpdateTime + 250) {
      updateState(newState);
      updateCluster();
      lastUpdateTime = Date.now();
    }
  };

  return {
    container,
    reset,
    start,
    stop,
    pause,
    update,
  };
};
