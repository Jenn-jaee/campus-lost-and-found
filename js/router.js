import { onAuthChange, isAdmin } from './auth.js';

/**
 * Require the visitor to be authenticated.
 * Redirects to login.html (with a returnUrl param) if not logged in.
 * @returns {Promise<Object>} Resolves with the Firebase user object.
 */
export function requireAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthChange((user) => {
      unsubscribe();

      if (!user) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `login.html?returnUrl=${returnUrl}`;
        return;
      }

      resolve(user);
    });
  });
}

/**
 * Require the visitor to be an authenticated admin.
 * Redirects to index.html if not logged in or not an admin.
 * @returns {Promise<Object>} Resolves with the Firebase user object.
 */
export function requireAdmin() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthChange((user) => {
      unsubscribe();

      if (!user || !isAdmin(user)) {
        window.location.href = 'index.html';
        return;
      }

      resolve(user);
    });
  });
}

/**
 * Check the current auth state without forcing a redirect.
 * Safe to call on any public page.
 * @returns {Promise<Object|null>} Resolves with the user or null.
 */
export function checkAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthChange((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
