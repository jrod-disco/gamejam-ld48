/**
 * Barrel file for all screen modules
 *
 * Screens are similar to components but speific to layout concerns
 * for a screen/layer of content, usually UI related.
 *
 * Screens are made up of a layout.ts for view concerns (container item placement, etc.)
 * and maybe an index.ts to serve as the controller
 */

// TODO Screens should evovlve to include a controller, maybe even a base class

// Example Screen
export { mainLayout } from './main/layout';
