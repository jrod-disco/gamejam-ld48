/**
 * Barrel file for all screen modules
 *
 * Screens are similar to components but speific to layout concerns
 * for a screen/layer of content, usually UI related.
 *
 * Screens are made up of a layout.ts for view concerns (container item placement, etc.)
 * and maybe an index.ts to serve as the controller
 */

// Screen Controller
export { controller } from './controller';

// Example Screen One
export { mainLayout } from './main/layout';

// Example Screen Two
export { secondLayout } from './second/layout';
