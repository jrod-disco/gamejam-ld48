import * as PIXI from 'pixi.js';

export const debugLayer = (c: PIXI.Container): any => {
  const debugContainer = new PIXI.Container();
  c.addChild(debugContainer);

  const drawRect = (g, b): any => {
    g.drawRect(b.x, b.y, b.width, b.height);
  };
  const drawBounds = (object: any, color: any): void => {
    const g = new PIXI.Graphics();
    g.lineStyle(1, color, 0.5);
    debugContainer.addChild(g);

    if (Array.isArray(object)) {
      object.forEach((element) => {
        const b = element.getBounds();
        drawRect(g, b);
      });
    } else {
      const b = object.getBounds();
      drawRect(g, b);
    }
  };

  return { drawBounds };
};
