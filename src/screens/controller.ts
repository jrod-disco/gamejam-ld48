import { ScreenName } from '.';

//export type Name = string;

export type Screen = { name: ScreenName; ref: any };

export interface SceenController {
  setCurrentScreen: ({ name: ScreenName, isAnimated: boolean }) => ScreenName;
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
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
const screenController = ({ initialScreen = null }: Props): SceenController => {
  // Screens

  // Screen State
  const screenState = {
    list: {},
    currentScreen: initialScreen,
  };

  const setCurrentScreen = ({ name, isAnimated }): ScreenName => {
    const prevScreen = screenState.currentScreen;
    screenState.currentScreen = screenState.list[name];
    console.log(`screen transition from ${prevScreen || 'BOOT'} to ${name}`);

    screenState.list[name]?.setVisibility({
      isVisible: true,
      isAnimated: true,
      onCompleteCallback: () => {
        // callback for when screen fade on is complete
      },
    });

    screenState.list[prevScreen]?.setVisibility({
      isVisible: false,
      isAnimated: true,
      onCompleteCallback: () => {
        // callback for when screen fade on is complete
      },
    });

    return prevScreen;
  };

  const getScreen = (screen: ScreenName): Screen => {
    return { name: screen, ref: screenState.list[screen] };
  };

  const getCurrentScreen = (): Screen => getScreen(screenState.currentScreen);

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
   * Usage: `onViewScreen(screenCredits);`
   *
   */
  const onViewScreen = (name: ScreenName): void => {
    setCurrentScreen({ name, isAnimated: true });
    //
    // fade out welcome text
    screenState.list[name].setVisibility({
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
    setCurrentScreen(screenState.list[ScreenName.SECOND]);
    //
    // fade in welcome text
    screenState.list[ScreenName.MAIN].setVisibility({
      isVisible: true,
      isAnimated: true,
    });
    // fade out leaderboards
    screenState.list[screen].setVisibility({
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

export const controller = screenController({});
