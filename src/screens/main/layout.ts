import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import * as COMP from '@src/components';
import { Spritesheets } from '@src/core';
import { APP_HEIGHT, APP_WIDTH } from '@src/constants';

export type VisibilityConfig = {
  isVisible: boolean;
  isAnimated: boolean;
  onCompleteCallback?: () => void;
};
export interface MainMenuLayout {
  container: PIXI.Container;
  setVisibility: (config: VisibilityConfig) => void;
  name: () => string;
}

interface Props {
  pos?: { x: number; y: number };
  spriteSheets?: Spritesheets;
  onSampleButtonPress: () => void;
}

/**
 * A layout for our main menu to be placed on in the main containeer
 * and show/hidden based on UI state
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const mainMenuLayout = (props: Props): MainMenuLayout => {
  const pos = props.pos ?? {
    x: 0,
    y: 0,
  };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  const { spriteSheets, onSampleButtonPress } = props;

  container.name = 'main menu layout';
  const name = (): string => 'MAIN';

  // Text
  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Impact, Charcoal, sans-serif',
    fontSize: 32,
    fill: ['#ccc'],
    fillGradientType: 1,
    fillGradientStops: [0.35],
    dropShadow: false,
    dropShadowColor: '#000000',
    dropShadowBlur: 10,
    dropShadowDistance: 5,
    align: 'center',
  });

  const helloWorldText = new PIXI.Text('SIMPLE GAME!', textStyle);
  helloWorldText.anchor.set(0.5);
  helloWorldText.position.x = APP_WIDTH / 2;
  helloWorldText.position.y = 40;
  container.addChild(helloWorldText);

  // Interactive Elements --------

  // Start Button
  const buttonStart = COMP.LIB.btnSimple({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT / 2 },
    buttonTexture: spriteSheets.main.textures['btn_again.png'],
    onPress: onSampleButtonPress,
  });
  container.addChild(buttonStart.container);

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

    buttonStart.setEnabled(isVisible);
  };

  // Default to hidden
  setVisibility({
    isVisible: false,
    isAnimated: false,
  });

  return {
    container,
    name,
    setVisibility,
  };
};
