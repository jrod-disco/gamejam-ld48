import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { FireboardAuth } from './auth';

import { getAppVerShort } from '@src/util/appVer';
import {
  FIREBOARD_SCORES_LIMIT,
  FIREBOARD_USERS_COLLECTION,
  FIREBOARD_SCORES_COLLECTION,
  GAME_MODES,
} from '@src/constants';

export interface FireboardStore {
  init: () => void;
  refresh: () => void;
  checkHighScore: (props: CheckHighScoreProps) => boolean;
  getUserInfo: () => { uid: string; name: string };
  setFireboardAuthRef: (authRef: FireboardAuth) => void;
  setGameMode: (gameMode: GAME_MODES) => void;
  addUser: (props: AddUserProps) => void;
}

export interface PlayerScore {
  uid: string;
  score: number;
  level: number;
  mode: number;
  appver: string;
  date: number;
}

export interface PlayerScoreRender extends PlayerScore {
  initials: string;
}

export interface UserData {
  initials: string;
}

export interface AddScoreProps {
  fbRef?: firebase.firestore.DocumentReference;
  playerScore: PlayerScore;
}

export interface AddUserProps {
  fbRef?: firebase.firestore.DocumentReference;
  userData: UserData;
}

export interface CheckHighScoreProps {
  playerScore: PlayerScore;
  shouldPost: boolean;
}

export type FirebaseScoreList = Array<firebase.firestore.DocumentData>;
export type PlayerScoreList = Array<PlayerScoreRender>;

interface Props {
  renderCallback?: (payload) => void; // called async after fetchScores completes
}

/**
 * fireboardStore
 * @description module for minding the store
 * @param props  optional renderCallback for handling the scoresList (an array of PlayerScore data)
 */
export const fireboardStore = (props: Props): FireboardStore => {
  let fireboardAuthRef = null;
  let lastScores: PlayerScoreList = [
    {
      uid: 'AAA',
      initials: 'BBB',
      score: 0,
      level: 0,
      mode: 0,
      appver: '0.0', //getAppVerShort(),
      date: Date.now(),
    },
  ];
  let scoresList: PlayerScoreList = [];
  let userBestScore = 0;
  let gameMode = GAME_MODES.DEFAULT;

  const setGameMode = (newGameMode): void => {
    gameMode = newGameMode;
    refresh();
  };

  // Default renderCallback used if one isn't passed in
  const displayScores = (scores: PlayerScoreList): void => {
    // console.log('fireboards store default displayScores', scores);
  };
  // Use the passed renderCallback, or the above
  const renderCallback = props.renderCallback
    ? props.renderCallback
    : displayScores;

  /**
   * addScore
   * @description stores a user score in the FIREBOARD_SCORES_COLLECTION
   * @param props an optional firebase reference and a PlayerScores object
   */
  const addScore = (props: AddScoreProps): void => {
    // Default firestore if not passed in
    const fbRef = !props.fbRef ? firebase.firestore() : props.fbRef;
    // Add the score to the collection
    fbRef
      .collection(FIREBOARD_SCORES_COLLECTION)
      .doc(`${getUserId()}_${gameMode}`)
      .set(props.playerScore);
  };

  // This should be coming from the auth module
  const getUserId = (): string | null => {
    const uid = firebase.auth().currentUser?.uid;
    //console.log(firebase.auth().currentUser);
    return uid;
  };

  /**
   * addUser
   * @description stores a new user in the FIREBOARD_USERS_COLLECTION
   * @param props fbRef(optional), userData{uid,initials}
   */
  const addUser = (props: AddUserProps): void => {
    // console.log('addUser', getUserId(), props);
    // Default firestore if not passed in
    const fbRef = !props.fbRef ? firebase.firestore() : props.fbRef;
    // Add the score to the collection using the uid as the document name
    // We use set because it will not create a new document unlike add
    fbRef
      .collection(FIREBOARD_USERS_COLLECTION)
      .doc(getUserId())
      .set(props.userData);
  };

  /**
   * getUserInitials
   * @description an async function that pulls the uid named document from the users collection
   * @param uid a valid Firebase user id
   * @returns a promise that resolves in a string bearing the user's initials
   */
  const getUserInitials = async (uid: string): Promise<string> => {
    let initials = '...';
    return firebase
      .firestore()
      .collection(FIREBOARD_USERS_COLLECTION)
      .doc(uid)
      .get()
      .then((snapshot) => {
        initials = snapshot.data()?.initials;
        return initials;
      });
  };

  /**
   * getUserBestScore
   * @description an async function that pulls the uid named document from the users collection
   * @param uid a valid Firebase user id
   * @returns a promise that resolves in a string bearing the user's best score
   */
  const getUserBestScore = async (uid: string): Promise<number> => {
    let score = 0;
    return firebase
      .firestore()
      .collection(FIREBOARD_SCORES_COLLECTION)
      .doc(uid)
      .get()
      .then((snapshot) => {
        score = snapshot.data()?.score;
        return score;
      });
  };

  /**
   * checkScoreHigh
   *
   * @param score a valid ScoreDataObject
   * @param shouldPost boolean - whether to post to firestore if a high score
   */
  const checkHighScore = (props: CheckHighScoreProps): boolean => {
    let didAdd = false;
    const { playerScore, shouldPost } = props;
    // console.log(
    //   `is ${props.playerScore.score} > ${
    //     userBestScore
    //     //lastScores[lastScores.length - 1].score
    //   }`
    // );
    if (
      shouldPost &&
      props.playerScore.score >= userBestScore
      // (lastScores.length >= FIREBOARD_SCORES_LIMIT
      //   ? lastScores[FIREBOARD_SCORES_LIMIT - 1].score
      //   : 0)
    ) {
      addScore({ playerScore });
      didAdd = true;
    }
    return didAdd;
  };

  /**
   * init
   * @description Fires up our Fireboards, initializes firebase w/ our app config, queues up an initial render of the leaderboards
   */
  const init = (): void => {
    const firebaseConfig = {
      // @ts-ignore - __ABC__ will be replaced via .env
      apiKey: __FIREBASE_APIKEY__,
      // @ts-ignore
      authDomain: `${__FIREBASE_ID__}.firebaseapp.com`,
      // @ts-ignore
      databaseURL: `https://${__FIREBASE_ID__}.firebaseio.com`,
      // @ts-ignore
      projectId: __FIREBASE_ID__,
      // @ts-ignore
      storageBucket: `${__FIREBASE_ID__}.appspot.com`,
      // @ts-ignore
      messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
      // @ts-ignore
      appId: __FIREBASE_APP_ID__,
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    refresh();
  };

  const refresh = (): void => {
    // fetchScores();

    // Subscribe to updates to refresh score list on change
    firebase
      .firestore()
      .collection(FIREBOARD_SCORES_COLLECTION)
      .where('appver', '==', getAppVerShort())
      .where('mode', '==', gameMode)
      .orderBy('score', 'desc')
      .limit(FIREBOARD_SCORES_LIMIT)
      .onSnapshot((snapshot) => {
        scoresList = [];
        let iCount = 0;
        snapshot.docs.forEach((score, index) => {
          //
          const userId = getUserId();
          const scoreData = score.data() as PlayerScoreRender;

          //
          // Note that score.id gives us the document id, which is the uid (and since v0.9.0) concatenated with "_XX" where XX is the game mode
          // this allows for multiple scores for one player - but only one score per game mode
          // The name of thee paired user document is simply the uid, so we have to strip off the "_XX"
          const scoreId = score.id.split('_')[0];
          //
          if (gameMode != 0 && scoreData.mode != gameMode) return;
          //console.log(`past mode check score.id:${scoreId} userId:${userId}`);
          // Check if this is the current user and stash their best score for later
          if (scoreId === userId) {
            userBestScore = scoreData.score;
          }
          // Asynchronously add the user's initials to the list

          getUserInitials(scoreId).then((n) => {
            scoresList[index].initials = n;
            // Re-render once we've gotten all initials in
            iCount++;
            if (iCount >= snapshot.docs.length) renderCallback(scoresList);
            // TODO: Having to count promise fulfilment feels wrong
          });
          scoresList[index] = scoreData;
        });
        lastScores = scoresList;
        // Initial render (will have placeholder initials until the getUserInitials promises resolve)
        // renderCallback(scoresList);
      });
  };

  /**
   * setFireboardAuthRef
   * @param authRef reference to an instance of our Auth module
   */
  const setFireboardAuthRef = (authRef: FireboardAuth): void => {
    fireboardAuthRef = authRef;
  };

  /**
   * getUserInfo
   * @returns an object containing the current user's uid and display name (not initials)
   */
  const getUserInfo = (): { uid: string; name: string } => {
    const uid = fireboardAuthRef?.getUserId();
    const name = fireboardAuthRef?.getUserName();
    return { uid, name };
  };

  // Reveal the following functions in this module
  return {
    init,
    refresh,
    checkHighScore,
    getUserInfo,
    setFireboardAuthRef,
    setGameMode,
    addUser,
  };
};
