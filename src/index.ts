import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';

import initPIXI, { PixiConfig } from './pixi';
import { APP_HEIGHT, APP_WIDTH } from './constants';
import './index.scss';

import * as comp from './components';

const hostDiv = document.getElementById('inner');
const hostWidth = APP_WIDTH;
const hostHeight = APP_WIDTH * (APP_HEIGHT / APP_WIDTH);
const pixiConfig: PixiConfig = {
  width: hostWidth,
  height: hostHeight,
  backgroundColor: 0x1e2422,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
};
console.log('pixiconfig', hostDiv, pixiConfig);
const app = (): void => {
  PixiPlugin.registerPIXI(PIXI);

  const { app, mainContainer } = initPIXI(pixiConfig, hostDiv);
  app.renderer.autoDensity = true;

  const exampleComponent = comp.example({});
  mainContainer.addChild(exampleComponent.container);

  // Register component UPDATE routines
  // ------------------------------------
  app.ticker.add((delta) => {
    // Update individual components
    exampleComponent.update(delta);
  });
};

app();
