import * as PIXI from 'pixi.js';

const _tintMatrix = (hex): PIXI.Filter => {
  const color = new PIXI.filters.ColorMatrixFilter();
  const tint = hex;
  const r = (tint >> 16) & 0xff;
  const g = (tint >> 8) & 0xff;
  const b = tint & 0xff;
  color.matrix[0] = r / 255;
  color.matrix[6] = g / 255;
  color.matrix[12] = b / 255;
  return color;
};

/**
 * Tints a display object to a hex color using PIXI.filters.ColorMatrixFilter()
 * - If tinting text it may be better to use text.tint
 * - Processor intensive for multiple sprites, best to tint an outer container
 *
 *```ts
 * tintDisplayObject(mySprite, 0xFF00FF)
 * ```
 *
 * @param displayObj - a valid PIXI.DisplayObject
 * @param hex - a hex color
 */
export const tintDisplayObject = (
  displayObj: PIXI.DisplayObject,
  hex: number
): void => {
  displayObj.filters = [_tintMatrix(hex)];
};
