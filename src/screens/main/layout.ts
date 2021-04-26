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
  showPressedStartButton: () => void;
  showPressedCreditsButton: () => void;
}

interface Props {
  pos?: { x: number; y: number };
  spriteSheets?: Spritesheets;
  onPlayButtonPress: () => void;
  onCreditsButtonPress: () => void;
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

  const { spriteSheets, onPlayButtonPress, onCreditsButtonPress } = props;

  container.name = 'main menu layout';
  const name = (): string => 'MAIN';

  const titleBackground = PIXI.Texture.from('./assets/titlescreen.png');
  const titleSprite = new PIXI.Sprite(titleBackground);
  container.addChild(titleSprite);

  // // Text
  // const mainTitle = new PIXI.Text('DEEPER AND DEEPER', TEXT_STYLE.TITLE_WHITE);
  // mainTitle.anchor.set(0.5);
  // mainTitle.position.x = APP_WIDTH / 2;
  // mainTitle.position.y = 40;
  // container.addChild(mainTitle);

  const promptText = new PIXI.Text(
    `Navigate your deep sea craft using W, A, S, D, or the arrow keys. Grab the O2 tanks to stay alive. Hold SPACE for a speed boost.
    Get to the underwater research lab before the pizza gets cold or you may pay with your life.`,
    TEXT_STYLE.GRADIENT_PROMPT
  );
  promptText.anchor.set(0.5);
  promptText.position.x = APP_WIDTH / 2;
  promptText.position.y = 480;
  container.addChild(promptText);

  // Interactive Elements --------

  // Start Button
  const buttonStartTexture = PIXI.Texture.from(
    './assets/buttons/btn_start.png'
  );
  const buttonStartTexturePressed = PIXI.Texture.from(
    './assets/buttons/btn_start.png'
  );

  const showPressedStartButton = (): void => {
    buttonStart.setTexture(buttonStartTexturePressed);
  };

  const buttonStart = COMP.LIB.btnSimple({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT / 2 },
    buttonTexture: buttonStartTexture,
    onPress: () => {
      showPressedStartButton();
      onPlayButtonPress();
    },
  });
  container.addChild(buttonStart.container);

  // Credits Button
  const buttonCreditsTexture = PIXI.Texture.from(
    './assets/buttons/btn_credits.png'
  );
  const buttonCreditsTexturePressed = PIXI.Texture.from(
    './assets/buttons/btn_credits.png'
  );

  const showPressedCreditsButton = (): void => {
    buttonCredits.setTexture(buttonCreditsTexturePressed);
  };

  const buttonCredits = COMP.LIB.btnSimple({
    pos: { x: APP_WIDTH / 2, y: APP_HEIGHT / 2 + 90 },
    buttonTexture: buttonCreditsTexture,
    onPress: () => {
      showPressedCreditsButton();
      onCreditsButtonPress();
    },
  });

  container.addChild(buttonCredits.container);

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
    buttonCredits.setEnabled(isVisible);

    // since we're using textures for button state, set it back to up when visible
    if (isVisible) buttonStart.setTexture(buttonStartTexture);
    if (isVisible) buttonCredits.setTexture(buttonCreditsTexture);
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
    showPressedStartButton,
    showPressedCreditsButton,
  };
};
