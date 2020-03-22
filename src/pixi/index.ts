import * as PIXI from 'pixi.js';

const initPIXI = (): void => {
  const pixiConfig = {
    width: 300,
    height: 300,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
  };

  const app = new PIXI.Application(pixiConfig);
  document.body.appendChild(app.view);

  const container = new PIXI.Container();
  app.stage.addChild(container);
};

export default initPIXI;
