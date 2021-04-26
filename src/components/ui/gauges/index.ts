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

type GaugesState = {
  isOn: boolean;
  oxygen: number;
  power: number;
  integrity: number;
  structure: number;
};

const horizontalGauge = ({
  label = '',
  width = 150,
  height = 8,
  color = THEME.TXT_HUD_HEX,
  x = 0,
  y = 0,
}) => {
  const gauge = new PIXI.Container();
  gauge.position.set(x, y);

  let barOffsetY = 0;

  if (label) {
    barOffsetY = 18;

    const labelTitle = new PIXI.BitmapText(label, {
      fontName: `FFFFuego-16`,
      fontSize: 14,
      align: 'left',
    });
    labelTitle.tint = THEME.TXT_TITLES_HEX;

    gauge.addChild(labelTitle);
  }

  const bgBar = new PIXI.Graphics();
  bgBar.beginFill(THEME.TXT_TITLES_HEX);
  bgBar.drawRect(0, 0, width, height);
  bgBar.endFill();
  bgBar.alpha = 0.4;
  bgBar.position.y += barOffsetY;

  const fgBar = new PIXI.Graphics();
  fgBar.beginFill(color);
  fgBar.drawRect(0, 0, width, height);
  fgBar.endFill();
  fgBar.alpha = 0.8;
  fgBar.position.y += barOffsetY;

  gauge.alpha = 0.8;
  gauge.addChild(bgBar, fgBar);

  /**
   * Scale the gauge to a new percentage value (0 to 1)
   */
  const setValue = (newValue: number): void => {
    fgBar.width = width * newValue;
  };

  return {
    container: gauge,
    setValue,
  };
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

  let state: GaugesState = {
    isOn: true,
    oxygen: 0,
    power: 0,
    integrity: 0,
    structure: 0,
  };

  const initialState = { ...state };

  const oxygen = horizontalGauge({
    label: 'O2',
    color: 0x35d694,
  });
  container.addChild(oxygen.container);

  const power = horizontalGauge({
    label: 'Power',
    color: 0x35d694,
    y: 30
  });
  container.addChild(power.container);

  const health = horizontalGauge({
    label: 'Health',
    color: 0xe81313,
    y: 60,
  });
  container.addChild(health.container);

  const updateState = (playerState: PlayerState) => {
    state.oxygen = playerState.oxygen;
    state.power = playerState.power;
    state.integrity = playerState.integrity;
  };

  const updateCluster = (): void => {
    oxygen.setValue(state.oxygen / 100);
    power.setValue(state.power / 100);
    health.setValue(state.integrity / 100);
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
