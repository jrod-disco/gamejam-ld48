export type KeyInput = {};

export type KeyInputProps = {
  config: {};
};

/**
 * Generic and configurable key listener component
 *
 * @returns The interface to this component
 *
 */

export const keyInput = (config: KeyInputProps): KeyInput => {
  // Keyboard Input
  const onKeyDown = (event: KeyboardEvent): void => {
    // Using current event.code now that .keycode is deprecated

    // TODO: Flesh out a generic key controll module that can be externally configured

    // This code was brought over from the core.ts - it should be way more generic
    // traditionally this was done with a switch statement
    // to make it configurable from outside the library this
    // wil need to change.

    switch (event.code) {
      case 'Backquote': // toggle audio
        //  onAudioCycleOptions();
        break;
      case 'Space': // Start
      case 'Enter': // Start
        //  screenMainMenu.showPressedButton();
        //  startGame();
        break;
    }

    console.log(event.code);
  };

  /**
   * Allows for overriding the initial configuration
   */
  const configureOnKeyDown = (config: KeyInputProps): void => {
    //
  };

  /**
   * Adds listener to window object
   */
  const addOnKeyDown = (): void => {
    window.addEventListener('keydown', onKeyDown);
  };

  /**
   * Removes listener from window object
   */
  const removeOnKeyDown = (): void =>
    window.removeEventListener('keydown', onKeyDown);

  return {};
};
