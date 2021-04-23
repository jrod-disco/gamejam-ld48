import { sendToLocalStorage, fetchFromLocalStorage } from './localStorage';
import { APP_NAME, APP_VERSION, GAME_MODES } from '@src/constants';
import { getAppVerShort } from '@src/util/appVer';
import {
  FireboardStore,
  PlayerScore,
  CheckHighScoreProps,
} from '@src/components/library/fireboards/store';

type Score = number;

export interface PersonalBestScores {
  getPersonalBest: () => Score;
  checkPersonalBest: (score: Score, level: number, mode: number) => boolean;
  setFireboardStore?: (fireboardStore: FireboardStore) => void;
}

export const personalBestScores = (
  getGameMode: () => GAME_MODES
): PersonalBestScores => {
  //
  // Keep a local copy of the personal best so we don't have to fetch it every single time
  let currentBest: Score;
  let localFireboardRef: FireboardStore = null;

  const setFireboardStore = (fireboardStore: FireboardStore): void => {
    localFireboardRef = fireboardStore;
  };

  const fetchPersonalBest = (): Score => {
    // retrieve the best score from wherever
    const storedBest = Number(
      fetchFromLocalStorage(
        `personalBestScore_${APP_NAME}_v${getAppVerShort()}_m${getGameMode()}_`
      )
    );
    // console.log('personal best is', storedBest);
    return storedBest as Score;
  };

  const storePersonalBest = (score: Score): void => {
    // store the best score to wherever
    // console.log('storing new best', score);
    sendToLocalStorage(
      `personalBestScore_${APP_NAME}_v${getAppVerShort()}_m${getGameMode()}_`,
      score
    );
  };

  const getPersonalBest = (): Score => fetchPersonalBest();

  currentBest = fetchPersonalBest();

  const checkPersonalBest = (score: Score, level = 0, mode = 0): boolean => {
    let isNewPersonalBest = false;
    // do some stuff to see if this score is better than the last one
    if (score > currentBest) {
      //  console.log('NEW PERSONAL BEST!!!');
      currentBest = score;
      storePersonalBest(currentBest);
      isNewPersonalBest = true;
    }

    // also check against leaderboards
    // only for authed users
    const uid = localFireboardRef?.getUserInfo().uid;
    if (score && localFireboardRef && uid) {
      const playerScore: PlayerScore = {
        uid,
        score,
        level,
        mode,
        appver: getAppVerShort(),
        date: Date.now(),
      };
      const checkHighScoreProps: CheckHighScoreProps = {
        playerScore,
        shouldPost: true,
      };
      localFireboardRef.checkHighScore(checkHighScoreProps);
    } else {
      console.warn(`checkPersonalBest:${!uid && ' Fireboards UID not found.'}`);
    }

    return isNewPersonalBest;
  };

  return {
    getPersonalBest,
    checkPersonalBest,
    setFireboardStore,
  };
};
