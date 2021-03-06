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
interface GuageProps {
  pos?: { x: number; y: number };
}
type GaugesState = {
  isOn: boolean;
  isBoosting: boolean;
  oxygen: number;
  power: number;
  integrity: number;
  structure: number;
};

type HorizontalGuageProps = {
  label: string;
  color: number;
  width?: number;
  height?: number;
  emphasisColor?: number;
  x?: number;
  y?: number;
};

interface HorizontalGauge {
  container: PIXI.Container;
  setEmphasis: (emphasized: boolean) => void;
  setValue: (newValue: number) => void;
}

const horizontalGauge = ({
  label = '',
  width = 150,
  height = 8,
  color = THEME.TXT_HUD_HEX,
  emphasisColor = 0xffffff,
  x = 0,
  y = 0,
}: HorizontalGuageProps): HorizontalGauge => {
  const BG_ALPHA = 0.4;
  const FG_ALPHA = 0.8;
  const OVERALL_ALPHA = 0.8;

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
    labelTitle.tint = 0xffffff; // TODO: figure out this theme ref

    gauge.addChild(labelTitle);
  }

  const bgBar = new PIXI.Graphics();
  bgBar.beginFill(THEME.TXT_TITLES_HEX);
  bgBar.drawRect(0, 0, width, height);
  bgBar.endFill();
  bgBar.alpha = BG_ALPHA;
  bgBar.position.y += barOffsetY;

  const fgBar = new PIXI.Graphics();
  fgBar.beginFill(color);
  fgBar.drawRect(0, 0, width, height);
  fgBar.endFill();
  fgBar.alpha = FG_ALPHA;
  fgBar.position.y += barOffsetY;

  gauge.alpha = OVERALL_ALPHA;
  gauge.addChild(bgBar, fgBar);

  /**
   * Scale the gauge to a new percentage value (0 to 1)
   */
  const setValue = (newValue: number): void => {
    fgBar.width = width * newValue;
  };

  const setEmphasis = (emphasized: boolean): void => {
    fgBar.alpha = emphasized ? 1 : FG_ALPHA;
  };

  return {
    container: gauge,
    setEmphasis,
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
export const gauges = (props: GuageProps): Gauges => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();

  container.x = pos.x;
  container.y = pos.y;
  container.name = 'gauges';

  // STATE

  let state: GaugesState = {
    isOn: true,
    isBoosting: false,
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
    color: 0xe81313,
    emphasisColor: 0xf24f4f,
    y: 30,
  });
  container.addChild(power.container);

  const health = horizontalGauge({
    label: 'Health',
    color: 0xfbf236,
    y: 60,
  });
  container.addChild(health.container);

  const updateState = (playerState: PlayerState): void => {
    state.oxygen = playerState.oxygen;
    state.power = playerState.power;
    state.isBoosting = playerState.movement.boost;
    state.integrity = playerState.integrity;
  };

  const updateCluster = (): void => {
    oxygen.setValue(state.oxygen / 100);
    power.setValue(state.power / 100);
    power.setEmphasis(state.isBoosting);
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
