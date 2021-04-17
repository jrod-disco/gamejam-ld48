import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import { APP_HEIGHT, APP_WIDTH } from '@src/constants';

export type ScoreDataObject = { name: string; score: number };

export type VisibilityConfig = {
  isVisible: boolean;
  isAnimated: boolean;
  onCompleteCallback?: () => void;
};
export interface SecondLayout {
  container: PIXI.Container;
  reset: () => void;
  update: (delta: number) => void;
  setVisibility: (config: VisibilityConfig) => void;
}

interface Props {
  pos?: { x: number; y: number };
}

/**
 * A layout for our main menu to be placed on in the main containeer
 * and show/hidden based on UI state
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const secondLayout = (props: Props): SecondLayout => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'second layout';

  const reset = (): void => {
    container.removeChildren();
  };

  // Text
  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Impact, Charcoal, sans-serif',
    fontSize: 14,
    fill: ['#24506a', '#211e3c'],
    fillGradientType: 1,
    fillGradientStops: [0.35],
    dropShadow: true,
    dropShadowColor: '#fda04f',
    dropShadowBlur: 10,
    dropShadowDistance: 0,
    align: 'center',
  });

  const helloWorldText = new PIXI.Text(
    'Hello World, from Second Screen.',
    textStyle
  );
  helloWorldText.anchor.set(0.5);
  helloWorldText.position.x = APP_WIDTH / 2;
  helloWorldText.position.y = APP_HEIGHT - 20;
  container.addChild(helloWorldText);

  // Graphic Drawing Elements --------
  const graphicsElement = new PIXI.Graphics();
  graphicsElement.beginFill(0x79354a);
  graphicsElement.lineStyle(2, 0xfda04f);
  graphicsElement.drawRect(APP_WIDTH - 50, 50, 25, 100);
  // Add it to container
  container.addChild(graphicsElement);
  // You can still draw on it
  graphicsElement.drawCircle(50, 100, 25);

  // Interactive Elements --------

  //

  // Screen Visibility Toggle ---------
  const setVisibility = ({
    isVisible,
    isAnimated,
    onCompleteCallback,
  }: VisibilityConfig): void => {
    if (isAnimated) {
      gsap.to(container, 0.5, {
        delay: 0.25,
        alpha: isVisible ? 1 : 0,
        ease: Power0.easeOut,
        onComplete: () => {
          onCompleteCallback && onCompleteCallback();
        },
      });
    } else {
      container.alpha = isVisible ? 1 : 0;
    }
  };

  // Default to hidden
  setVisibility({
    isVisible: false,
    isAnimated: false,
  });

  const update = (delta: number): void => {
    graphicsElement.x += 5 * delta; // throttle by delta
    if (graphicsElement.x > APP_WIDTH) graphicsElement.x = APP_WIDTH * -1;
  };

  return { container, update, reset, setVisibility };
};
