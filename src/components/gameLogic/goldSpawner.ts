import {
  APP_HEIGHT,
  APP_WIDTH,
  GOLD_MAX_SPAWNS,
  GOLD_SPAWN_RATE,
} from '@src/constants';
import * as PIXI from 'pixi.js';
import { GoldNugget, goldNugget } from '../goldNugget';

export const goldSpawner = () => {
  let state = {
    lastSpawnTime: Date.now(),
    nuggetList: [],
  };
  const initialState = { ...state };

  const texture = PIXI.Texture.from('./assets/example/goldbox.png');

  const nuggetBuffer = 50;

  const spawn = (): GoldNugget => {
    if (state.lastSpawnTime + GOLD_SPAWN_RATE > Date.now()) return;

    state.lastSpawnTime = Date.now();
    if (state.nuggetList.length > GOLD_MAX_SPAWNS - 1) return;

    const rX =
      nuggetBuffer / 2 + Math.floor(Math.random() * (APP_WIDTH - nuggetBuffer));
    const rY =
      nuggetBuffer / 2 +
      Math.floor(Math.random() * (APP_HEIGHT - nuggetBuffer));

    const nugget = goldNugget({
      pos: { x: rX, y: rY },
      textures: { nuggetTexture: texture },
    });

    state.nuggetList.push(nugget);

    return nugget;
  };

  const getNuggets = (): GoldNugget[] => state.nuggetList;

  const removeNuggetByIndex = (i): void => {
    state.nuggetList.splice(i, 1);
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    console.log('gold spawner reset');

    state = { ...initialState, nuggetList: [] };
    console.log(state);
  };
  //reset();

  return {
    spawn,
    getNuggets,
    removeNuggetByIndex,
    reset,
  };
};
