import * as PIXI from 'pixi.js';
//import gsap from 'gsap';

interface ReturnType {
  container: PIXI.Container;
  update: (delta: number) => void;
}

interface Props {
  pos?: { x: number; y: number };
}

export const example = (props: Props): ReturnType => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  const texture = PIXI.Texture.from('../../assets/example/example.png');
  const sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(0.5);
  // sprite.scale.set(0.5);
  // sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
  // sprite.scale.x *= -1;

  container.addChild(sprite);

  const update = (delta): void => {
    // Update called by main
    container.rotation -= 0.05 * delta;
  };

  return { container, update };
};
