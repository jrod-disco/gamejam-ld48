// Environment
export const IS_SCORE_INCREMENTY = false;

// - mariana trench is 38k deep,  8000 lbs/sq in
export const MAX_DEPTH = 10_000;  // feet

// - roughly 1000 x surface. we'll call this 100 for game purposes
export const MAX_PRESSURE = 100;


// Player
export const PLAYER_SPEED = 5;  // not a constant, move
export const PLAYER_DESCENT_RATE = 0.2;  // feet per sec
export const PLAYER_CONTINOUS_MOVEMENT = true;

// Item Generator
export const MAX_ITEMS = 5;
export const ITEM_SPAWN_RATE = 1000;

// items spawn as depth increases




///////////////////////////////////////////////////////////////////////////////
// SIMPLE GAME - deprecate or use

// Gold
export const POINTS_GOLD = 5;
export const GOLD_SPAWN_RATE = 750;
export const GOLD_MAX_SPAWNS = 1000;

export const TIME_LIMIT_SECONDS = 10;
export const START_LEVEL = 1;

// Objects
export enum OBJECT_STATUS {
    ACTIVE,
    INACTIVE,
  }
  