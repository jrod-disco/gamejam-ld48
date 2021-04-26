import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import * as COMP from '@src/components';
import * as SCREENS from '@src/screens';
import { APP_HEIGHT, APP_WIDTH, TEXT_STYLE } from '@src/constants';

export type ScoreDataObject = { name: string; score: number };

export type VisibilityConfig = {
  isVisible: boolean;
  isAnimated: boolean;
  onCompleteCallback?: () => void;
};

export interface CreditsLayout {
  container: PIXI.Container;
  reset: () => void;
  setVisibility: (config: VisibilityConfig) => void;
}

interface Props {
  pos?: { x: number; y: number };
}

/**
 * A layout for our game screen to be placed on in the main containeer
 * and show/hidden based on UI state
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const creditsLayout = (props: Props): CreditsLayout => {
  const pos = props.pos ?? { x: 0, y: 0 };

  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'game credits layout';

  const reset = (): void => {
    container.removeChildren();
  };

  const backgroundTexture = PIXI.Texture.from('./assets/darkscreen.png');
  const backgroundSprite = new PIXI.Sprite(backgroundTexture);
  container.addChild(backgroundSprite);

  // Text

  const subTitle = new PIXI.Text('LudumDare 48', TEXT_STYLE.SCREEN_BODY_ALT);
  subTitle.anchor.set(0.5);
  subTitle.position.x = APP_WIDTH / 2;
  subTitle.position.y = APP_HEIGHT / 2 - 160;
  container.addChild(subTitle);

  const title = new PIXI.Text('CREDITS', TEXT_STYLE.SCREEN_TITLE);
  title.anchor.set(0.5);
  title.position.x = APP_WIDTH / 2;
  title.position.y = APP_HEIGHT / 2 - 130;
  container.addChild(title);

  const body = new PIXI.Text(
    `
  CODE
  Josh Bosworth
  Ryan Korsak
  James O'Reilly
  Jose Rodriguez

  ART
  Jose Rodriguez

  TUNES
  Josh Bosworth

  SFX
  Josh Bosworth
  `,
    TEXT_STYLE.SCREEN_BODY
  );
  body.anchor.set(0.5);
  body.position.x = APP_WIDTH / 2;
  body.position.y = APP_HEIGHT / 2 + 40;
  container.addChild(body);

  // Main Button
  const buttonMainTexture = PIXI.Texture.from(
    './assets/buttons/btn_mainmenu.png'
  );
  const buttonMainTexturePressed = PIXI.Texture.from(
    './assets/buttons/btn_mainmenu.png'
  );

  const showPressedMainButton = (): void => {
    buttonMain.setTexture(buttonMainTexturePressed);
  };

  const buttonMain = COMP.LIB.btnSimple({
    pos: { x: APP_WIDTH / 2 + 7, y: 540 },
    buttonTexture: buttonMainTexture,
    onPress: () => {
      showPressedMainButton();
      SCREENS.controller.setCurrentScreen({
        name: SCREENS.ScreenName.MAIN,
        isAnimated: true,
      });
    },
  });
  container.addChild(buttonMain.container);

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

    // automaticaly enable or disable the button, this functionality comes from the simple button component
    buttonMain.setEnabled(isVisible);

    // since we're using textures for button state, set it back to up when visible
    if (isVisible) buttonMain.setTexture(buttonMainTexture);
  };

  // Default to hidden
  setVisibility({
    isVisible: false,
    isAnimated: false,
  });

  return { container, reset, setVisibility };
};
