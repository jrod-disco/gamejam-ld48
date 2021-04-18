import * as PIXI from 'pixi.js';
import * as PIXISOUND from 'pixi-sound';
import gsap, { Power0 } from 'gsap';
import * as COMP from '@src/components';
import { Spritesheets } from '@src/core';
import {
  APP_HEIGHT,
  APP_WIDTH,
  TEXT_STYLE,
  SFX_VOL_MULT,
} from '@src/constants';

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
  const mainTitle = new PIXI.Text('SIMPLE GAME!', TEXT_STYLE.TITLE_WHITE);
  mainTitle.anchor.set(0.5);
  mainTitle.position.x = APP_WIDTH / 2;
  mainTitle.position.y = 40;
  container.addChild(mainTitle);

  const promptText = new PIXI.Text(
    'This is a very simple game made as an example of the bare bones of what is possibe with pixi and the dcollage boilerplate.',
    TEXT_STYLE.GRADIENT_PROMPT
  );
  promptText.anchor.set(0.5);
  promptText.position.x = APP_WIDTH / 2;
  promptText.position.y = 200;
  container.addChild(promptText);

  // Interactive Elements --------

  // Instance of the sound library (can play any preloaded sound)
  const pixiSound = PIXISOUND.default;

  // Start Button
  const buttonStartTexture = PIXI.Texture.from(
    './assets/buttons/startbutton.png'
  );
  const buttonStartTexturePressed = PIXI.Texture.from(
    './assets/buttons/startbutton_pressed.png'
  );
  const buttonStart = COMP.LIB.btnSimple({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT / 2 },
    buttonTexture: buttonStartTexture,
    onPress: () => {
      buttonStart.setTexture(buttonStartTexturePressed);
      pixiSound.play('good', {
        volume: 1 * SFX_VOL_MULT,
      });
      onSampleButtonPress();
    },
  });
  container.addChild(buttonStart.container);

  // Screen Visibility Toggle ---------
  // This will be called by the screen scontroller when switching screens.
  const setVisibility = ({
    isVisible,
    isAnimated,
    onCompleteCallback,
  }: VisibilityConfig): void => {
    if (isAnimated) {
      // Each screen is in chage of how they hide and show for maximum flexibility.
      gsap.to(container, 0.5, {
        delay: 0.25,
        alpha: isVisible ? 1 : 0,
        ease: Power0.easeOut,
        onComplete: () => {
          // Optional callback in case we want to trigger anything once the screen transition is complete
          onCompleteCallback && onCompleteCallback();
        },
      });
    } else {
      // if isAnimated is set to false we just hide it
      container.alpha = isVisible ? 1 : 0;
    }

    // automaticaly enable or disable the button, this functionality comes from the simple button component
    buttonStart.setEnabled(isVisible);

    // since we're using textures for button state, set it back to up when visible
    if (isVisible) buttonStart.setTexture(buttonStartTexture);
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
