import { sendToLocalStorage, fetchFromLocalStorage } from './localStorage';

type Score = number;

export interface HighScoreManager {
  getPersonalBest: () => Score;
  checkPersonalBest: (score: Score) => boolean;
}

export const highScores = (): HighScoreManager => {
  //
  // Keep a local copy of the personal best so we don't have to fetch it every single time
  let currentBest: Score;

  const getPersonalBest = (): Score => currentBest;

  const fetchPersonalBest = (): Score => {
    // retrieve the best score from wherever
    const storedBest = Number(fetchFromLocalStorage('personalBestScore'));
    return storedBest as Score;
  };

  const storePersonalBest = (score: Score): void => {
    // store the best score to wherever
    sendToLocalStorage('personalBestScore', score);
  };

  currentBest = fetchPersonalBest();
  console.log('highScores initialize - personal best is', currentBest);

  const checkPersonalBest = (newScore: Score): boolean => {
    let isNewPersonalBest = false;
    // do some stuff to see if this score is better than the last one
    if (newScore > currentBest) {
      console.log('NEW PERSONAL BEST!!!');
      currentBest = newScore;
      storePersonalBest(currentBest);
      isNewPersonalBest = true;
    }
    return isNewPersonalBest;
  };

  return {
    getPersonalBest,
    checkPersonalBest,
  };
};
