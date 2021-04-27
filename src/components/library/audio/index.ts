import * as PIXISOUND from 'pixi-sound';
import gsap, { Power0 } from 'gsap';
import { APP_NAME, MUSIC_VOL_MULT } from '@src/constants';
import {
  fetchFromLocalStorage,
  sendToLocalStorage,
} from '@src/util/localStorage';
import { getAppVerShort } from '@src/util/appVer';

export interface Sounds {
  MainTheme: PIXI.LoaderResource;
  MenuTheme: PIXI.LoaderResource;
  Track1: PIXI.LoaderResource;
  Track2: PIXI.LoaderResource;
  Track3: PIXI.LoaderResource;
}
export interface AudioLayer {
  music: {
    mainTheme: (isPlay: boolean) => void;
    menuTheme: (isPlay: boolean) => void;
    playRandomTrack: () => void;
    playTracklist: () => void;
    loopRandomTrack: () => void;
  };
  stopAll: () => void;
  muteToggle: (shouldMute?: boolean, isTemporary?: boolean) => void;
  getMutedState: () => boolean;
}

/**
 * Audio component which maps preloaded audio resources to the
 * default PIXISOUND class and returns functions which handle
 * various aspects of the audio for the game.
 *
 * @param sounds - an object containing a number of loader resources
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const audio = (sounds: Sounds): AudioLayer => {
  console.log('audio sounds: %o', sounds);

  // Main Music Track
  const audio = PIXISOUND.default;
  audio.add('MainTheme', sounds.MainTheme as any);
  audio.add('MenuTheme', sounds.MenuTheme as any);
  audio.add('Track1', sounds.Track1 as any);
  audio.add('Track2', sounds.Track2 as any);
  audio.add('Track3', sounds.Track3 as any);

  const trackList = ['Track1', `Track2`, `Track3`];
  let currentTrack = 0;

  // Fetch and use isMuted state stored in local storage
  const storedMutedState = fetchFromLocalStorage(
    `isMuted_${APP_NAME}_v${getAppVerShort()}`
  );
  let isMuted = storedMutedState === 'true' ? true : false;
  // Initial state
  if (isMuted) {
    audio.muteAll();
  } else {
    audio.unmuteAll();
  }

  const getMutedState = (): boolean => isMuted;

  // Utility Functions
  const fadeSound = ({ sound, time, callback, vol }): void => {
    //console.log('fade sound', sound);
    gsap.to(sound, {
      duration: time,
      volume: vol,
      ease: Power0.easeOut,
      onComplete: () => {
        callback && callback();
      },
    });
  };

  const mainVolume = (): number => 1 * MUSIC_VOL_MULT;
  const menuVolume = (): number => 1 * MUSIC_VOL_MULT;

  // Called when we've got all the things...
  const stopAllThemes = (): void => {
    audio.stop('MainTheme');
    audio.stop('MenuTheme');
    audio.stop('Track1');
    audio.stop('Track2');
    audio.stop('Track3');
  };
  const mainTheme = (isPlay): void => {
    stopAllThemes();
    if (isPlay) audio.play('MainTheme', { loop: true, volume: mainVolume() });
  };
  const menuTheme = (isPlay): void => {
    stopAllThemes();
    if (isPlay) audio.play('MenuTheme', { loop: true, volume: menuVolume() });
  };

  const playNextTrack = (): void => {
    currentTrack++;
    if (currentTrack > trackList.length - 1) currentTrack = 0;
    if (trackList[currentTrack]) {
      audio.play(trackList[currentTrack], {
        loop: false,
        volume: mainVolume(),
        complete: () => {
          playNextTrack();
        },
      });
    }
  };
  const playTracklist = (): void => {
    stopAllThemes();
    currentTrack = -1;
    playNextTrack();
  };

  const playRandomTrack = (): void => {
    currentTrack = Math.floor(Math.random() * trackList.length);
    stopAllThemes();
    playNextTrack();
  };

  const loopRandomTrack = (): void => {
    stopAllThemes();
    currentTrack = Math.floor(Math.random() * trackList.length);

    if (trackList[currentTrack]) {
      audio.play(trackList[currentTrack], {
        loop: true,
        volume: mainVolume(),
      });
    }
  };

  const stopAll = (): void => {
    stopAllThemes();
  };

  const muteToggle = (shouldMute?: boolean, isTemporary = false): void => {
    if (shouldMute === undefined) {
      isMuted = !isMuted;
    } else {
      isMuted = shouldMute;
    }

    if (isMuted) {
      audio.muteAll();
    } else {
      audio.unmuteAll();
    }

    // Store muted state as long as it isn't a temporary change
    !isTemporary &&
      sendToLocalStorage(
        `isMuted_${APP_NAME}_v${getAppVerShort()}`,
        String(isMuted)
      );
  };

  return {
    music: {
      mainTheme,
      menuTheme,
      playTracklist,
      playRandomTrack,
      loopRandomTrack,
    },
    stopAll,
    muteToggle,
    getMutedState,
  };
};
