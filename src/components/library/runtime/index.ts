import * as PIXI from 'pixi.js';

export interface RunTime {
  container: PIXI.Container;
  reset: () => void;
  start: () => void;
  stop: () => void;
  pause: () => void;
  update: (delta: number) => void;
  getRunTime: () => number;
}

interface Props {
  pos?: { x: number; y: number };
}

/**
 * Run Time UI. Displays how long the current run has been going/
 *
 * @param props - Standard component properties. **Plus** A reference to the Hero instance.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const runtime = (props: Props): RunTime => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'runtime';

  let state = {
    isOn: false,
    currentTime: 0,
  };

  const initialState = { ...state };

  const timeString = (): string => {
    return `${state.currentTime.toFixed(2)}`;
  };

  const getRunTime = (): number => Number(state.currentTime.toFixed(2));

  // Text
  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Impact, Charcoal, sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    fill: ['#ccc'],
    //fillGradientType: 1,
    //fillGradientStops: [0.35],
    dropShadow: false,
    dropShadowColor: '#000000',
    dropShadowBlur: 10,
    dropShadowDistance: 5,
    align: 'left',
  });

  const timeText = new PIXI.Text(timeString(), textStyle);
  timeText.anchor.set(0, 0.5);

  container.addChild(timeText);

  const updateTimeText = (): void => {
    timeText.text = timeString();
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    updateTimeText();
  };
  reset();

  let lastUpdateTime = Date.now();

  const start = (): void => {
    lastUpdateTime = Date.now();
    state = { ...state, isOn: true };
  };

  const stop = (): void => {
    state = { ...state, isOn: false, currentTime: 0 };
  };

  const pause = (): void => {
    state = { ...state, isOn: false };
  };

  const update = (delta): void => {
    // Update called by main

    if (state.isOn && Date.now() > lastUpdateTime + 10) {
      state.currentTime += 0.01;
      updateTimeText();
      lastUpdateTime = Date.now();
    }
  };

  return { container, reset, start, stop, pause, getRunTime, update };
};
