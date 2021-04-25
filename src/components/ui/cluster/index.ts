import * as PIXI from 'pixi.js';
import { THEME } from '@src/constants';

import { PlayerState } from '../../playerCharacter';

export interface Cluster {
  container: PIXI.Container;
  reset: () => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  update: (state: PlayerState) => void;
}

interface Props {
  pos?: { x: number; y: number };
}

type ClusterState = {
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
export const cluster = (props: Props): Cluster => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();

  container.x = pos.x;
  container.y = pos.y;
  container.name = 'cluster';

  // STATE

  let state: ClusterState = {
    isOn: true,
    oxygen: 0,
    power: 0,
    integrity: 0,
    structure: 0,
  };

  const initialState = { ...state };

  // TEXT
  const titleText = new PIXI.BitmapText('DEPTH', {
    fontName: `FFFFuego-16`,
    fontSize: 16,
    align: 'left',
  });
  titleText.anchor.set(0, 0);
  titleText.tint = THEME.TXT_TITLES_HEX;
  titleText.alpha = 0.8;

  const depthText = new PIXI.BitmapText('0000', {
    fontName: `FFFFuego-16-bold`,
    fontSize: 16,
    align: 'left',
  });
  depthText.anchor.set(0, 0);
  depthText.tint = THEME.TXT_HUD_HEX;
  depthText.position.y += 20;
  depthText.position.x += 2;

  container.addChild(titleText, depthText);

  const updateState = (playerState: PlayerState) => {
    state.oxygen = playerState.oxygen;
    state.power = playerState.power;
    state.integrity = playerState.integrity;
  };

  const updateCluster = (): void => {};

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
  const update = (delta, state): void => {
    // Update called by main
    if (state.isOn && Date.now() > lastUpdateTime + 10) {
      updateState(state);

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
