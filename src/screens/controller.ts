type ScreenName = string;

//export type Name = string;

export type Screen = { name: ScreenName; ref: any };

export type SetScreenProps = {
  name: string;
  isAnimated: boolean;
  onComplete?: () => void;
};
export interface SceenController {
  setCurrentScreen: (props: SetScreenProps) => ScreenName;

  getCurrentScreen: () => Screen;
  addScreenToList: (name: ScreenName, ref: any) => void;
  onViewScreen: (name: ScreenName) => void;
  onBackFromScreen: (name: ScreenName) => void;
}
interface Props {
  pos?: { x: number; y: number };
  initialScreen?: ScreenName;
}

/**
 * A very basic controller for screen layouts
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const screenController = ({
  initialScreen = '',
}: Props): SceenController => {
  // Screen State
  const screenState = {
    list: {},
    currentScreen: initialScreen,
    prevScreen: initialScreen,
  };

  /**
   * Set the current screen.
   * Tracks screen state and triggers visibility changes on the affected layouts
   *
   * @returns the name of the previous screen
   */
  const setCurrentScreen = (props: SetScreenProps): ScreenName => {
    const { name, isAnimated } = props;
    const onComplete = props.onComplete
      ? props.onComplete
      : (): void => {
          /* noop */
        };
    screenState.prevScreen = screenState.currentScreen;
    screenState.currentScreen = name;
    console.log(
      `screen transition from ${screenState.prevScreen || 'BOOT'} to ${name}`
    );

    screenState.list[name]?.setVisibility({
      isVisible: true,
      isAnimated: true,
      onCompleteCallback: () => {
        // callback for when screen fade on is complete
        onComplete();
      },
    });

    screenState.list[screenState.prevScreen]?.setVisibility({
      isVisible: false,
      isAnimated: true,
      onCompleteCallback: () => {
        // callback for when screen fade on is complete
        onComplete();
      },
    });

    return screenState.prevScreen;
  };

  const getScreen = (screen: ScreenName): Screen => {
    return { name: screen, ref: screenState.list[screen] };
  };

  /**
   *
   * @returns the name of the current screen
   */
  const getCurrentScreen = (): Screen => getScreen(screenState.currentScreen);

  /**
   * Adds a screen to the list of screens maintained by the controller.
   * This list is keyed on the screen name string which is used in other operations.
   *
   * @param name - a name to refer to this screen by
   * @param ref - the actual screen object instance
   */
  const addScreenToList = (name: ScreenName, ref: any): void => {
    if (screenState.list[name]) {
      console.warn(
        `Duplicate screen attempt. ${name} already exists.`,
        screenState.list[name]
      );
    } else {
      screenState.list[name] = ref;
    }
  };

  /**
   * Called by any button which switches screens
   * @example onViewScreen('mainMenu');
   *
   */
  const onViewScreen = (name: ScreenName): void => {
    console.log('view screen', screenState);
    setCurrentScreen({ name, isAnimated: true });
    //
    // fade out welcome text
    screenState.list[screenState.prevScreen].setVisibility({
      isVisible: false,
      isAnimated: true,
    });
    // fade in help
    screenState.list[name].setVisibility({
      isVisible: true,
      isAnimated: true,
    });
  };

  /**
   * Called by back button
   * Usage: `onBackFromScreen(screenState.currentScreen);`
   *
   */
  const onBackFromScreen = (screen: string): void => {
    setCurrentScreen(screenState.list[screenState.prevScreen]);
    //
    // fade in current screen
    screenState.list[screen].setVisibility({
      isVisible: true,
      isAnimated: true,
    });
    // fade out previous screen
    screenState.list[screenState.prevScreen].setVisibility({
      isVisible: false,
      isAnimated: true,
    });
  };

  return {
    setCurrentScreen,
    getCurrentScreen,
    addScreenToList,
    onViewScreen,
    onBackFromScreen,
  };
};
