import * as PIXI from 'pixi.js';

export interface Component {
  container: PIXI.Container;
  reset: () => void;
  update: (delta: number) => void;
}

interface ComponentProps {
  pos?: { x: number; y: number };
}

/**
 * A component boiler plate for use when creating new components
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const exampleComponent = (props: ComponentProps): Component => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'exampleComponent';

  let state = {};
  const initialState = { ...state };

  // Text
  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Impact, Charcoal, sans-serif',
    fontSize: 21,
    fontWeight: 'bold',
    fill: ['#fff'],
    align: 'center',
  });

  const sampleText = new PIXI.Text('DCollage', textStyle);
  sampleText.anchor.set(0.5, 0);

  container.addChild(sampleText);

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
  };
  reset();

  const update = (delta): void => {
    // Update called by main
  };

  return { container, reset, update };
};
