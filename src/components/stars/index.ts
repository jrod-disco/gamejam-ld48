import * as PIXI from 'pixi.js';

import { tintDisplayObject } from '@src/util/tintMatrix';
import { APP_HEIGHT, APP_WIDTH, THEME } from '@src/constants';

export interface Stars {
  container: PIXI.Container;
  reset: () => void;
  update: (delta: number) => void;
}

interface ComponentProps {
  pos?: { x: number; y: number };
  texture: PIXI.Texture;
}

/**
 * A star field
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const stars = (props: ComponentProps): Stars => {
  const pos = props.pos ?? {
    x: 0,
    y: 0,
  };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'stars';

  let state = {};
  const initialState = {
    ...state,
  };

  const starTexture = props.texture;

  const starAmount = 20;
  const baseSpeed = 5;
  let warpSpeed = 0;
  let cameraZ = 0;
  let speed = 0.01;
  const starStretch = 0;
  const fov = 30;
  const starBaseSize = 0.1;

  const randomizeStar = (star, initial?: boolean): void => {
    star.z = initial
      ? Math.random() * 2000
      : cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
  };

  // Create the stars
  const stars = [];
  for (let i = 0; i < starAmount; i++) {
    const star = {
      sprite: new PIXI.Sprite(starTexture),
      z: 0,
      x: 0,
      y: 0,
    };
    star.sprite.anchor.set(0.5);

    randomizeStar(star, true);
    container.addChild(star.sprite);

    stars.push(star);
  }

  // Tint Matrix for Color Modes
  tintDisplayObject(container, THEME.FILLS_HEX);

  // Reset called by play again and also on init
  const reset = (): void => {
    state = null;
    state = {
      ...initialState,
    };
  };
  reset();

  const update = (delta): void => {
    // Update called by main
    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * 4 * (speed + baseSpeed);

    stars.forEach((star) => {
      if (star.z < cameraZ) randomizeStar(star);

      // Map star 3d position to 2d with really simple projection
      const z = star.z - cameraZ;
      star.sprite.x = star.x * (fov / z) * APP_WIDTH + APP_WIDTH / 2;
      star.sprite.y = star.y * (fov / z) * APP_WIDTH + APP_HEIGHT / 2;

      // Calculate star scale & rotation.
      const dxCenter = star.sprite.x - APP_WIDTH / 2;
      const dyCenter = star.sprite.y - APP_HEIGHT / 2;
      const distanceCenter = Math.sqrt(
        dxCenter * dxCenter + dyCenter * dyCenter
      );
      const distanceScale = Math.max(0, (2000 - z) / 2000);
      star.sprite.scale.x = distanceScale * starBaseSize;
      // Star is looking towards center so that y axis is towards center.
      // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
      star.sprite.scale.y =
        distanceScale * starBaseSize +
        (distanceScale * speed * starStretch * distanceCenter) / APP_WIDTH;
      star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    });
  };

  return {
    container,
    reset,
    update,
  };
};
