import './index.scss';
import initPIXI from './pixi';

const main = (): void => {
  const message = 'I am alive.';
  console.log(message);
  initPIXI();
};

main();
