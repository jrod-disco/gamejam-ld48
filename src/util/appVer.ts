import { APP_VERSION } from '@src/constants';

// Returns only the major and minor version (I.e. 1.2.3 becomes 1.2)
// Used for storing scores in Fireboards
export const getAppVerShort = (): string =>
  APP_VERSION.split('.').slice(0, 2).join('.');
