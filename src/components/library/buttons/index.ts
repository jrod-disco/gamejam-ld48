import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import { tintDisplayObject } from '@src/util/tintMatrix';
import { THEME } from '@src/constants';

export interface Button {
  container: PIXI.Container;
  setEnabled: (isEnabled: boolean) => void;
  setDisabled: () => void;
  setTexture: (buttonTexture: PIXI.Texture) => void;
  setOnPressed: (onPress: () => void) => void;
}

interface ButtonProps {
  buttonTexture: PIXI.Texture;
  onPress: () => void;
  anchor?: { x: number; y: number };
  pos?: { x: number; y: number };
}

/**
 * Play Again button
 *
 * @param props - Standard component properties. **Plus** the `onPress` callback.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const btnSimple = (props: ButtonProps): Button => {
  const pos = props.pos ?? {
    x: 0,
    y: 0,
  };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  const spriteAnchor = props.anchor ?? {
    x: 0.5,
    y: 0.5,
  };

  container.name = 'btnSimple';

  const { buttonTexture } = props;

  const sprite = new PIXI.Sprite(buttonTexture);
  sprite.anchor.set(spriteAnchor.x, spriteAnchor.y);
  sprite.interactive = false;
  sprite.buttonMode = true;
  container.alpha = 0;
  sprite.on('mousedown', props.onPress).on('touchstart', props.onPress);

  container.addChild(sprite);

  let myTween = null;

  const setTexture = (buttonTexture: PIXI.Texture): void => {
    sprite.texture = buttonTexture;
  };

  const setOnPressed = (newOnPress: () => void): void => {
    sprite.off('mousedown').off('touchstart');
    sprite.on('mousedown', newOnPress).on('touchstart', newOnPress);
  };

  const setEnabled = (isEnabled: boolean): void => {
    gsap.killTweensOf(container);
    if (isEnabled) {
      container.alpha = 0;
      //container.y = pos.y + 10;
      myTween = gsap.to(container, {
        duration: 0.25,
        delay: 0.25,
        alpha: 1,
        y: pos.y,
        ease: Power0.easeOut,
        onComplete: () => {
          sprite.interactive = true;
        },
      });
    } else {
      //container.alpha = 1;
      container.y = pos.y;
      myTween = gsap.to(container, {
        duration: 0.2,
        alpha: 0,
        // y: pos.y + 10,
        ease: Power0.easeIn,
        onComplete: () => {
          sprite.interactive = false;
        },
      });
    }
  };

  const setDisabled = (): void => {
    gsap.killTweensOf(container);

    container.alpha = 0.5;
    container.y = pos.y;
    sprite.interactive = false;
  };

  return {
    container,
    setEnabled,
    setDisabled,
    setTexture,
    setOnPressed,
  };
};
