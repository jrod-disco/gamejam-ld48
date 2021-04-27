// Environment
export const IS_SCORE_INCREMENTY = false;

// - mariana trench is 40k deep,  8000 lbs/sq in
// - for faux ocean floor:
export const INIT_DEPTH = 0;
export const MAX_DEPTH = 5000; // feet
export const BEGIN_LANDING_DEPTH = 4500; // feet
export const INIT_PRESSURE = 14; // sea level
export const MAX_PRESSURE = 1000; // lbs/sq in

export const LANDING_PAUSE_DURATION = 4000; // ms
export const GAME_OVER_SCREEN_DELAY = 6000; // ms

// - Depth effects
export const MAX_LAYER_SCALE = 2.5; // % scale of layer at MAX_LAYER_DEPTH
export const MAX_PICKUP_SCALE = 4; // % scale of pickup at MAX_LAYER_DEPTH
export const MAX_LAYER_DEPTH = 32; // layers of sprite depth
export const LAYER_SPACING = 0.075; // start distance between each layer
export const LAYER_START_SCALE = 0.25; // % scale the layer at depth 0
export const START_ROT = 5; // starting rotation degrees for object
export const ROT_INCREMENT = 0.001; // amount of rotation degrees per update()
export const ROT_PICKUP_INCREMENT = 0.01; // amount of rotation degrees per update()
export const PICKUP_HIT_LO = 1.5; // scale at which pickup collision occurs
export const PICKUP_HIT_HI = 3; // scale at which pickup collision occurs

export const SPEED_CAVE = 0.003; // cave scale increase per update()
export const SPEED_ITEM = 0.01; // cave scale increase per update()

// - Normalized world sizes
export const WORLD_WIDTH = 100;
export const WORLD_HEIGHT = 100;

// Player movement
export const PLAYER_SPRITE_MARGIN = 40; // approx size of player
export const PLAYER_ACCEL = 0.038; // rate of acceleration when explicitly moving
export const PLAYER_DECEL = 0.009; // constant rate of deceleration, aka drag
export const PLAYER_BOOST_SCALE = 2.5; // when boosting, multiplies acceleration by this amount
export const PLAYER_INIT_ROT = 0;
export const PLAYER_ROT_DAMPEN = 0.09; // scales the rotation to ease into small changes
export const PLAYER_MAX_ROT_CHANGE = 0.08; // the max change in rotation per update
export const PLAYER_ROTATE_ON_MOVE = true;
export const PLAYER_DESCENT_RATE = 0.5; // feet per sec

// Player tilt
export const PLAYER_TILT_BY_ANGLE = true;
export const PLAYER_TILT_ANGLE_THRESHOLD = 0.2;
export const PLAYER_TILT_SPEED_THRESHOLD = 1;

// resources
export const PLAYER_INTEGRITY = 100; // starting integrity
export const PLAYER_MAX_OXYGEN = 100; // full tank, init value
export const PLAYER_OXYGEN_CONSUMPTION_RATE = 0.7; // lbs per second
export const PLAYER_MAX_POWER = 100; // full tank, init value
export const PLAYER_IDLE_POWER_CONSUMPTION_RATE = 0.2; // power per second
export const PLAYER_POWER_CONSUMPTION_RATE = 0.7; // power per second
export const PLAYER_BOOST_POWER_CONSUMPTION_RATE = 5; // power per second while boosting

// collision
export const PLAYER_COLLISION_RADIUS = 170;
export const PLAYER_COLLISION_VALUE = 15; // damage from wall collision
export const PLAYER_COLLISION_DRAG = -0.3; // rebound drag

// ITEMS
export enum PICKUP_TYPES {
  OXYGEN = 'OXYGEN',
  FUEL = 'FUEL',
}

// PICKUP Generator
export const PICKUPS_MAX = 6;
export const PICKUPS_RANDOM_WEIGHT = 90;
export const PICKUP_SPAWN_RATE = 4000;
export const PICKUP_OXYGEN_TANK_QUANTITY = 4; // lbs of oxygen
export const PICKUP_FUEL_TANK_QUANTITY = 3.5; // lbs of fuel

// Objects
export enum OBJECT_STATUS {
  ACTIVE,
  INACTIVE,
}

///////////////////////////////////////////////////////////////////////////////
// SIMPLE GAME - deprecate or use

export const POINTS_DEPTH_MULTIPLIER = [5, 10, 25, 50];
export const POINTS_WIN = 15000;

// Gold
export const POINTS_GOLD = 2;
export const GOLD_SPAWN_RATE = 750;
export const GOLD_MAX_SPAWNS = 1000;
export const TIME_LIMIT_SECONDS = 10;
export const START_LEVEL = 1;
