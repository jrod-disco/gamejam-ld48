// TODO Defined Screen type - using any for now
export type Screen = any;

export interface SceenController {
  setCurrentScreen: ({ screen: any, isAnimated: boolean }) => Screen;
  getCurrentScreen: () => Screen;
}
interface Props {
  pos?: { x: number; y: number };
  initialScreen?: Screen;
}

/**
 * A very basic controller for screen layouts
 *
 * @param props - Standard component properties.
 *
 * @returns Interface object containing methods that can be called on this module
 */
const screenController = ({ initialScreen = null }: Props): SceenController => {
  // Screen State
  const screenState = {
    currentScreen: initialScreen,
  };

  const setCurrentScreen = ({ screen, isAnimated }): string => {
    const prevScreen = screenState.currentScreen;
    screenState.currentScreen = screen;
    console.log(`screen transition from ${prevScreen} to ${screen}`);

    screen?.setVisibility({
      isVisible: true,
      isAnimated: true,
      onCompleteCallback: () => {
        // callback for when screen fade on is complete
      },
    });

    prevScreen?.setVisibility({
      isVisible: false,
      isAnimated: true,
      onCompleteCallback: () => {
        // callback for when screen fade on is complete
      },
    });

    return prevScreen;
  };

  const getCurrentScreen = (): Screen => screenState.currentScreen;

  return { setCurrentScreen, getCurrentScreen };
};

export const controller = screenController({});
