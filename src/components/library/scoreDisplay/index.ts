import * as PIXI from 'pixi.js';
import { IS_SCORE_INCREMENTY, THEME } from '@src/constants';
import { zeroPad } from '@src/util/zeroPad';

export interface ScoreDisplay {
  container: PIXI.Container;
  reset: () => void;
  update: (delta: number) => void;
  setScore: (newScore: number) => void;
  getScore: () => number;
  addToScore: (points: number) => number;
}

interface Props {
  pos?: { x: number; y: number };
}

type State = {
  currentScore: number;
  currentScorePool: number;
};

/**
 * Score Display - Displays  the current score, handles score incrementing over time
 *
 * @param props - Standard component properties. **Plus** A reference to the Hero instance.
 *
 * @returns Interface object containing methods that can be called on this module
 */
export const scoreDisplay = (props: Props): ScoreDisplay => {
  const pos = props.pos ?? { x: 0, y: 0 };
  const container = new PIXI.Container();
  container.x = pos.x;
  container.y = pos.y;

  container.name = 'scoreDisplay';

  let state: State = {
    currentScore: 0,
    currentScorePool: 0,
  };

  const initialState = { ...state };

  // Text
  const scoreString = (): string => {
    return zeroPad(state.currentScore, 7);
  };

  const scoreText = new PIXI.BitmapText(scoreString(), {
    fontName: `Atari-32`,
    fontSize: 32,
    align: 'center',
  });
  scoreText.tint = THEME.TXT_HUD_HEX;
  scoreText.anchor.set(0.5, 0);

  container.addChild(scoreText);

  const updateText = (): void => {
    scoreText.text = scoreString();
  };

  const getScore = (): number => Number(state.currentScore);

  const setScore = (newScore: number): void => {
    state.currentScore = newScore;
    updateText();
  };

  const addToScore = (points: number): number => {
    const newScore = getScore() + points;

    if (IS_SCORE_INCREMENTY) {
      state.currentScorePool += points;
    } else {
      // Directly set the score for display
      setScore(newScore);
    }

    return newScore;
  };

  // Reset called by play again and also on init
  const reset = (): void => {
    state = { ...initialState };
    updateText();
  };
  reset();

  const update = (delta): void => {
    // Update called by main
    if (state.currentScorePool > state.currentScore) {
      const scoreBy = state.currentScorePool - state.currentScore < 11 ? 1 : 10;
      const newScore = getScore() + scoreBy;

      setScore(newScore);
    }
  };

  return { container, reset, update, getScore, setScore, addToScore };
};
