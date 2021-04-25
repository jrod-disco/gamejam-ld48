import { DisplayObject } from "@pixi/display";
import { APP_HEIGHT, APP_WIDTH, MAX_CAVE_DEPTH } from '@src/constants';

/**
 * Positions a display object with depth applied. Supply x,y coords as
 * if the object is located on the same plane as the submarine. This will
 * adjust the location to take into account depth of the object.
 * 
 * @param obj      DisplayObject
 * @param x        X at submarine plane
 * @param y        Y at submarine plane
 * @param depth    relative to MAX_CAVE_DEPTH
 */
export const positionUsingDepth = (
    obj: DisplayObject, x: number, y: number, depth: number
): void => {
    obj.position.x = APP_WIDTH/2 + ((APP_WIDTH/2-x)/MAX_CAVE_DEPTH) * depth;
    obj.position.y = APP_HEIGHT/2 + ((APP_HEIGHT/2-y)/MAX_CAVE_DEPTH) * depth;
}