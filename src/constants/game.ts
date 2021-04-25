// Environment
export const IS_SCORE_INCREMENTY = false;

// - mariana trench is 40k deep,  8000 lbs/sq in
// - for faux ocean floor:
export const MAX_DEPTH = 5_000; // feet
export const INIT_DEPTH = 0;
export const MAX_PRESSURE = 1000; // lbs/sq in
export const INIT_PRESSURE = 14; // sea level

// Player
export const PLAYER_MAX_SPEED = 5; // not a constant, move
export const PLAYER_ACCEL = 0.02; // rate of acceleration when explicitly moving
export const PLAYER_DECEL = 0.008; // constant rate of deceleration, aka drag
export const PLAYER_DESCENT_RATE = 0.5; // feet per sec
export const PLAYER_MAX_OXYGEN = 100; // full tank, init value
export const PLAYER_OXYGEN_CONSUMPTION_RATE = 0.6; // lbs per second
export const PLAYER_INTEGRITY = 2000; // starting integrity (not yet consuming)
export const PLAYER_CONTINOUS_MOVEMENT = false;
export const PLAYER_INIT_ROT = 0;

// ITEMS
export enum PICKUP_TYPES {
  OXYGEN = 'OXYGEN',
}

// PICKUP Generator
export const PICKUPS_MAX = 3;
export const PICKUP_SPAWN_RATE = 3500;
export const PICKUP_OXYGEN_TANK_QUANTITY = 2; // lbs of oxygen

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
