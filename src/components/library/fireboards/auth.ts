import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import * as firebaseui from 'firebaseui';
import { FireboardStore, UserData } from './store';
import { FIREBOARD_USERS_COLLECTION } from '@src/constants';

// Initialize the FirebaseUI Widget using Firebase.
const CLIENT_ID = null;

export interface LifeCycleCallbacks {
  onInit: () => void;
  onComplete: (props: { email: string; initials: string }) => void;
  onSignedOut: () => void;
}
export interface FireboardAuth {
  init: () => void;
  getUserId: () => string;
  getUserName: () => string;
  setFireboardStoreRef: (storeRef: FireboardStore) => void;
  signUserOut: () => void;
  signUserIn: () => void;
}
export const fireboardAuth = (
  lifecycleCallbacks: LifeCycleCallbacks
): FireboardAuth => {
  const { onInit, onComplete, onSignedOut } = lifecycleCallbacks;
  let ui = null;
  let userInitials = '';
  let fireboardStoreRef: FireboardStore | null = null;

  const getUserId = (): string | null => firebase.auth().currentUser?.uid;
  const getUserEmail = (): string | null => firebase.auth().currentUser?.email;
  const getUserName = (): string | null =>
    firebase.auth().currentUser?.displayName;

  const setFireboardStoreRef = (storeRef: FireboardStore): void => {
    fireboardStoreRef = storeRef;
  };

  const storeUserData = (userData: UserData): void => {
    fireboardStoreRef.addUser({ userData });
  };

  /**
   * FirebaseUI initialization to be used in a Single Page application context.
   */

  /**
   * @return {!Object} The FirebaseUI config.
   */
  const getUiConfig = (): object => {
    return {
      callbacks: {
        // Called when the user has been successfully signed in.
        signInSuccessWithAuthResult: (authResult, redirectUrl): boolean => {
          if (authResult.user) {
            handleSignedInUser(
              authResult.user,
              authResult.additionalUserInfo.isNewUser
            );
          }
          // Do not redirect.

          return false;
        },
      },

      // Opens IDP Providers sign-in flow in a popup.
      signInFlow: 'popup',
      signInSuccessUrl: '/',
      // Auth providers
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          // Required to enable ID token credentials for this provider.
          clientId: CLIENT_ID,
        },
        {
          provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          scopes: ['public_profile', 'email'],
        },
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        },
      ],

      // Terms of service url.
      tosUrl: 'https://www.jrvisuals.com',
      // Privacy policy url.
      privacyPolicyUrl: 'https://www.jrvisuals.com',
      // credentialHelper:
      //   CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID'
      //     ? firebaseui.auth.CredentialHelper.GOOGLE_YOLO
      //     : firebaseui.auth.CredentialHelper.NONE,
    };
  };

  // Disable auto-sign in.
  // ui.disableAutoSignIn();

  /**
   * Displays the UI for a signed in user.
   * @param {!firebase.User} user
   */
  const handleSignedInUser = async (user, isNew?): Promise<any> => {
    //console.log('handleSignedInUser');

    const onCompleteProps = { email: getUserEmail(), initials: '' };

    document.getElementById('auth').style.display = 'none';
    // This should only for first time auth
    if (isNew) {
      // storeUserData({ initials: userInitials });
      onCompleteProps.initials = userInitials;
    } else {
      // Get Existing User Initials
      await firebase
        .firestore()
        .collection(FIREBOARD_USERS_COLLECTION)
        .doc(getUserId())
        .get()
        .then((snapshot) => {
          onCompleteProps.initials = snapshot.data()?.initials;
        });

      // This is where we overwrite the existing initials with new ones
      if (onCompleteProps.initials != userInitials && userInitials != '') {
        onCompleteProps.initials = userInitials;
        storeUserData({ initials: onCompleteProps.initials });
      }

      //console.log('user already exists ->', onCompleteProps);
    }

    // Rather than grabbing the stored initials here we're going to assume
    // that the user wants to update their initials (for now)
    // storeUserData({ initials: onCompleteProps.initials });

    onComplete(onCompleteProps); // <- complete lifecycle callback, passed in on instantiation
  };

  /**
   * handleFieldChange
   * @description event handler for typing in the initials field; we're forcing them to upper case and storing them
   */
  const handleFieldChange = (): void => {
    const element: any = document.getElementById(
      'initialsField'
    ) as HTMLInputElement;
    // store for later use
    userInitials = element.value.toUpperCase();
  };
  // Init userInitials
  handleFieldChange();

  /**
   * Show FirebaseUI
   */
  const initFirebaseUI = (): void => {
    //console.log('init firebase called');
    document.getElementById('authInitials').style.display = 'none';
    document.getElementById('authContinue').style.display = 'none';
    document.getElementById('authWrapper').style.display = 'flex';

    /*
    document.getElementById('authAnon').style.display = 'flex';
    document.getElementById('authAnon').onclick = (): void => {
      console.log('sign in anonymously');
      firebase
        .auth()
        .signInAnonymously()
        .catch(function (error) {
          // Handle Errors here.
          console.error(`ERROR ${error.code}\n ${error.message}`);
          // ...
        });
      document.getElementById('auth').style.display = 'none';
    };
    */
  };
  /**
   * Displays the UI for a signed out user.
   */
  const handleSignedOutUser = (): void => {
    // console.log('handleSignedOutUser');
    onSignedOut();
  };

  const signUserIn = (): void => {
    // const rememberedAccounts = JSON.parse(
    //   window.localStorage.getItem('firebaseui::rememberedAccounts')
    // )[0];
    //console.log(rememberedAccounts);

    ui.start('#firebaseui-auth-container', getUiConfig());

    document.getElementById('auth').style.display = 'flex';
    document.getElementById('authInitials').style.display = 'flex';
    document.getElementById('authContinue').style.display = 'flex';
    document.getElementById('authWrapper').style.display = 'none';
    document.getElementById('authError').style.display = 'none';
    document.getElementById('initialsField').focus();
    document
      .getElementById('initialsField')
      .addEventListener('input', handleFieldChange);
    document.getElementById('initialsField').onkeydown = (e): boolean => {
      if (e.keyCode == 32) {
        return false;
      }
    };
    document.getElementById('authContinue').onclick = (): void => {
      if (userInitials === '') {
        document.getElementById('initialsField').focus();
        document.getElementById('authError').style.display = 'flex';
        return;
      }
      //console.log('accept initials and continue', userInitials);
      initFirebaseUI();
    };
  };

  // Listen to change in auth state so it displays the correct UI for when
  // the user is signed in or not.
  firebase.auth().onAuthStateChanged((user) => {
    //console.log('onAuthStateChanged', user?.uid);
    user ? handleSignedInUser(user, false) : handleSignedOutUser();
  });

  // The start method will wait until the DOM is loaded.
  const init = (): void => {
    onInit(); // <- init lifecycle callback, passed in on instantiation
    document.getElementById('auth').style.display = 'none';
    ui = new firebaseui.auth.AuthUI(firebase.auth());
  };

  // Sign user out
  const signUserOut = (): void => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        //console.log('user successfully signed out');
      })
      .catch(function (error) {
        // An error happened.
        console.warn('error logging out', error);
      });
  };

  return {
    init,
    getUserId,
    getUserName,
    setFireboardStoreRef,
    signUserOut,
    signUserIn,
  };
};
