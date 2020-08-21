import * as PIXI from 'pixi.js';
import gsap, { Power0 } from 'gsap';
import * as PIXIPARTICLES from 'pixi-particles';

export interface BestScoreDisplay {
  container: PIXI.Container;
  reset: () => void;
  setText: (newText: string, isNewPersonalBest: boolean) => void;
  setVisibility: (isVisible: boolean) => void;
  update: (delta: number) => void;
}

interface BestScoreProps {
  pos?: { x: number; y: number };
  particleTextures: Array<PIXI.Texture>;
}

/**
 * Displays the user's persona best score after a run
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const bestScoreDisplay = (props: BestScoreProps): BestScoreDisplay => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'personal best';

  const { particleTextures } = props;

  // Text
  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Impact, Charcoal, sans-serif',
    fontSize: 12,
    fill: ['#ccc'],
    fillGradientType: 1,
    fillGradientStops: [0.35],
    dropShadow: false,
    dropShadowColor: '#000000',
    dropShadowBlur: 10,
    dropShadowDistance: 5,
    align: 'center',
  });

  // "Personal Best" text
  const pbText = new PIXI.Text('PERSONAL BEST', textStyle);
  pbText.anchor.set(0.5);
  container.addChild(pbText);

  // Actual score text
  const bigTextStyle = new PIXI.TextStyle({
    ...textStyle,
    fontSize: 26,
    fontWeight: 'bold',
    fill: ['#999'],
  });

  const bigTextGoldStyle = new PIXI.TextStyle({
    ...bigTextStyle,
    fill: ['#fbc536'],
  });

  const timeText = new PIXI.Text('0.00', bigTextStyle);
  timeText.anchor.set(0.5, 0);
  timeText.y = 5;
  container.addChild(timeText);

  const setText = (newText: string, isNewPersonalBest: boolean): void => {
    timeText.text = newText;
    const newTextStyle = isNewPersonalBest ? bigTextGoldStyle : bigTextStyle;
    emitter.emit = isNewPersonalBest;
    particleContainer.alpha = isNewPersonalBest ? 1 : 0;
    timeText.style = newTextStyle;
  };

  const setVisibility = (isVisible: boolean): void => {
    if (isVisible) {
      container.alpha = 0;
      gsap.to(container, 0.2, {
        delay: 1.75,
        alpha: 1,
        ease: Power0.easeOut,
      });
    } else {
      gsap.to(container, 0.2, {
        alpha: 0,
        ease: Power0.easeIn,
      });
    }
  };

  // Emitters for high score celebration
  const particleContainer = new PIXI.Container();
  container.addChild(particleContainer);
  particleContainer.alpha = 0;
  const colorObject = { color: { start: '#fbc536', end: '#fbb336' } };
  const emitterConfigBase = {
    alpha: {
      start: 1,
      end: 0,
    },
    scale: {
      start: 1,
      end: 1,
      minimumScaleMultiplier: 1,
    },
    speed: {
      start: 0,
      end: 0,
      minimumSpeedMultiplier: 1,
    },
    acceleration: {
      x: 0,
      y: +16,
    },
    maxSpeed: 256,
    noRotation: true,
    lifetime: {
      min: 0.35,
      max: 1,
    },
    blendMode: 'add',
    frequency: 0.04,
    emitterLifetime: 500,
    maxParticles: 128,
    pos: {
      x: 0,
      y: 0,
    },
    addAtBack: false,
    spawnType: 'rect',
    spawnRect: {
      x: -32,
      y: 0,
      w: 64,
      h: 32,
    },
  };

  const emitterConfig = { ...emitterConfigBase, ...colorObject };
  const emitter = new PIXIPARTICLES.Emitter(
    particleContainer,
    particleTextures,
    emitterConfig
  );

  // Reset called by play again and also on init
  const reset = (): void => {
    setVisibility(false);
    particleContainer.alpha = 0;
    emitter.emit = false;
  };
  reset();

  const update = (delta): void => {
    // Update called by main
    // bail on updates if we're not visible
    if (container.alpha < 1) return;
    emitter.emit && emitter.update(delta * 0.025);
  };

  return { container, reset, setText, setVisibility, update };
};
