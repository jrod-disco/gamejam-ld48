import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import { APP_HEIGHT, APP_WIDTH, TEXT_STYLE } from '@src/constants';

export type ScoreDataObject = { name: string; score: number };

export type VisibilityConfig = {
  isVisible: boolean;
  isAnimated: boolean;
  onCompleteCallback?: () => void;
};
export interface LoseLayout {
  container: PIXI.Container;
  reset: () => void;
  update: (delta: number) => void;
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
export const loseLayout = (props: Props): LoseLayout => {
  console.log('loseLayout', props);

  const pos = props.pos ?? { x: 0, y: 0 };

  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'game lose layout';

  const reset = (): void => {
    container.removeChildren();
  };

  const backgroundTexture = PIXI.Texture.from('./assets/darkscreen.png');
  const backgroundSprite = new PIXI.Sprite(backgroundTexture);
  container.addChild(backgroundSprite);

  // Text
  const promptText = new PIXI.Text(
    'THAT DID NOT END WELL...',
    TEXT_STYLE.GRADIENT_PROMPT
  );
  promptText.anchor.set(0.5);
  promptText.position.x = APP_WIDTH / 2;
  promptText.position.y = APP_HEIGHT / 2;
  container.addChild(promptText);

  // TODO:
  // - bitmap texture of sadness

  // Interactive Elements --------
  // - make button

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
    // graphicsElement.x += 5 * delta; // throttle by delta
  };

  return { container, update, reset, setVisibility };
};
