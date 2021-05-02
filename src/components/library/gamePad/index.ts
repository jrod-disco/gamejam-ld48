// Generic GamePad Support

// Assuming all of this will be module scoped.

export const initialize = (): void => {
  window.addEventListener('gamepadconnected', (event) => {
    console.log('A gamepad connected:');
    console.log(event);
  });

  window.addEventListener('gamepaddisconnected', (event) => {
    console.log('A gamepad disconnected:');
    console.log(event);
  });
};

export const update = (delta: number): void => {
  const gamepads = navigator.getGamepads();
  // console.log(gamepads);
};
