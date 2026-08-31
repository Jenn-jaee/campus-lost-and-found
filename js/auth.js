import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Change this to the actual admin email for your deployment
export const ADMIN_EMAIL = 'obinwannejennifer@gmail.com';

/**
 * Sign in an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Register a new user, then set their display name.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function register(name, email, password) {
  const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if (!isAdminEmail && !email.toLowerCase().endsWith('@philander.edu')) {
    const err = new Error('Registration is restricted to Philander Smith University students. Please use your @philander.edu email address.');
    err.code = 'auth/invalid-domain';
    throw err;
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential;
}

/**
 * Sign the current user out.
 * @returns {Promise<void>}
 */
export async function logout() {
  return signOut(auth);
}

/**
 * Get the currently signed-in user, or null if not authenticated.
 * @returns {import('firebase/auth').User|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Subscribe to authentication state changes.
 * @param {function(import('firebase/auth').User|null): void} callback
 * @returns {function} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Returns true if the given user is the admin.
 * @param {import('firebase/auth').User|null} user
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function sendPasswordReset(email) {
  const actionCodeSettings = {
    url: `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}login.html`,
    handleCodeInApp: false,
  };
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
}
