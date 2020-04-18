import * as PIXI from 'pixi.js';

export interface PixiConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias: boolean;
  resolution: number;
}

const initPIXI = (
  pixiConfig: PixiConfig,
  baseElement: HTMLElement
): { app: PIXI.Application; mainContainer: PIXI.Container } => {
  const app = new PIXI.Application(pixiConfig);
  baseElement.appendChild(app.view);

  const mainContainer = new PIXI.Container();
  app.stage.addChild(mainContainer);

  return { app, mainContainer };
};

export default initPIXI;
