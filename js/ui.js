// Pure UI utility functions — no Firebase imports.

// ---------------------------------------------------------------------------
// Time formatting
// ---------------------------------------------------------------------------

/**
 * Format a date as a human-readable relative time string.
 * Accepts a Date object, ISO string, or Firestore Timestamp (has .toDate()).
 * @param {Date|string|{toDate: function}} dateInput
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';

  let date;
  if (typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = new Date(dateInput);
  }

  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

/**
 * Map a post status string to a CSS badge class.
 * @param {string} status
 * @returns {string}
 */
export function badgeClass(status) {
  const map = {
    lost: 'badge-lost',
    found: 'badge-found',
    matched: 'badge-matched',
    claimed: 'badge-claimed',
    resolved: 'badge-resolved',
    cancelled: 'badge-cancelled',
    'under-review': 'badge-under-review',
    pending: 'badge-claimed',
    confirmed: 'badge-found',
    dismissed: 'badge-resolved',
  };
  return map[status] || 'badge-resolved';
}

// ---------------------------------------------------------------------------
// Item icons
// ---------------------------------------------------------------------------

/**
 * Return an inline SVG string for a given item type.
 * All icons use viewBox="0 0 24 24", stroke="currentColor", stroke-width="2",
 * fill="none", stroke-linecap="round", stroke-linejoin="round".
 * @param {string} itemType
 * @returns {string} SVG markup string
 */
export function getItemIcon(itemType) {
  const base = (paths) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

  const icons = {
    'Backpack':
      base('<path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>'),

    'Wallet':
      base('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/>'),

    'Phone':
      base('<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'),

    'Keys':
      base('<circle cx="7" cy="7" r="4"/><path d="M10.5 10.5L20 20"/><path d="M17 17l2 2"/><path d="M14 14l2 2"/>'),

    'ID Card':
      base('<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M14 8h4"/><path d="M14 12h4"/><path d="M6 16h12"/>'),

    'Laptop':
      base('<rect x="2" y="3" width="20" height="13" rx="2"/><path d="M0 20h24"/><path d="M8 20h8"/>'),

    'Earphones':
      base('<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'),

    'Water Bottle':
      base('<path d="M8 2h8"/><path d="M9 2v2.8A6 6 0 0 0 6 10v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9a6 6 0 0 0-3-5.2V2"/><line x1="6" y1="15" x2="18" y2="15"/>'),

    'Clothing':
      base('<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>'),

    'Notebook':
      base('<path d="M2 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2z"/><line x1="6" y1="3" x2="6" y2="21"/><line x1="10" y1="8" x2="18" y2="8"/><line x1="10" y1="12" x2="18" y2="12"/><line x1="10" y1="16" x2="18" y2="16"/>'),

    'Other':
      base('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')
  };

  return icons[itemType] || icons['Other'];
}

// ---------------------------------------------------------------------------
// Public display name (never exposes raw email on browse/detail)
// ---------------------------------------------------------------------------

function capitalizeWord(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Derive a display name from a Philander email: segment after the first dot,
 * before @philander.edu (e.g. jennifer.obinwanne@philander.edu → Obinwanne).
 * @param {string} email
 * @returns {string}
 */
export function nameFromPhilanderEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const lower = email.toLowerCase().trim();
  const suffix = '@philander.edu';
  if (!lower.endsWith(suffix)) {
    const local = lower.split('@')[0] || '';
    return capitalizeWord(local);
  }
  const local = lower.slice(0, -suffix.length);
  const dotIdx = local.indexOf('.');
  if (dotIdx === -1) return capitalizeWord(local);
  return capitalizeWord(local.slice(dotIdx + 1));
}

/**
 * Name shown on cards and item detail — uses stored name fields, else email-derived fallback.
 * @param {{ contactFirstName?: string, contactLastName?: string, email?: string }} post
 * @returns {string}
 */
export function getPostDisplayName(post) {
  if (!post) return 'Unknown';

  const first = (post.contactFirstName || '').trim();
  const last = (post.contactLastName || '').trim();
  if (first || last) return [first, last].filter(Boolean).join(' ');

  const fromEmail = nameFromPhilanderEmail(post.email);
  return fromEmail || 'Unknown';
}

// ---------------------------------------------------------------------------
// Card builder
// ---------------------------------------------------------------------------

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

const CLOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

const LIGHTNING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

/**
 * Build and return a report card <a> element for a post.
 * @param {{ id: string, name: string, itemType: string, status: string, photoUrl?: string, location: string, createdAt: any, email: string, matchedWith?: string }} post
 * @returns {HTMLAnchorElement}
 */
export function buildReportCard(post) {
  const card = document.createElement('a');
  card.className = 'report-card';
  card.href = `item-detail?id=${encodeURIComponent(post.id)}`;

  // --- Photo section ---
  const cardPhoto = document.createElement('div');
  cardPhoto.className = 'card-photo';

  if (post.photoUrl) {
    const img = document.createElement('img');
    img.src = escapeAttr(post.photoUrl);
    img.alt = escapeHtml(post.name || '');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    cardPhoto.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'card-photo-placeholder';
    placeholder.innerHTML = getItemIcon(post.itemType);
    cardPhoto.appendChild(placeholder);
  }

  // Badge overlay
  const badge = document.createElement('span');
  badge.className = `badge badge-overlay ${badgeClass(post.status)}`;
  badge.textContent = (post.status || '').toUpperCase();
  cardPhoto.appendChild(badge);

  card.appendChild(cardPhoto);

  // --- Body section ---
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = post.name || '';
  cardBody.appendChild(title);

  const type = document.createElement('div');
  type.className = 'card-type';
  type.textContent = post.itemType || '';
  cardBody.appendChild(type);

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.innerHTML = PIN_SVG + escapeHtml(post.location || '');
  cardBody.appendChild(meta);

  const time = document.createElement('div');
  time.className = 'card-time';
  time.innerHTML = CLOCK_SVG + formatRelativeTime(post.createdAt);
  cardBody.appendChild(time);

  const divider = document.createElement('div');
  divider.className = 'card-divider';
  cardBody.appendChild(divider);

  const nameLine = document.createElement('div');
  nameLine.className = 'card-name';
  nameLine.textContent = 'Name: ' + getPostDisplayName(post);
  cardBody.appendChild(nameLine);

  card.appendChild(cardBody);

  // --- Match strip (optional) — div avoids nested <a> inside card link ---
  if (post.matchedWith) {
    const matchId = post.matchedWith;
    const matchStrip = document.createElement('div');
    matchStrip.className = 'card-match-strip';
    matchStrip.setAttribute('role', 'link');
    matchStrip.tabIndex = 0;
    matchStrip.innerHTML = LIGHTNING_SVG + 'Potential match found \u2014 tap to view';
    const goToMatch = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `item-detail?id=${encodeURIComponent(matchId)}`;
    };
    matchStrip.addEventListener('click', goToMatch);
    matchStrip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') goToMatch(e);
    });
    card.appendChild(matchStrip);
  }

  return card;
}

// ---------------------------------------------------------------------------
// Toast notifications
// ---------------------------------------------------------------------------

/**
 * Show a brief toast notification at the bottom of the screen.
 * @param {string} message
 * @param {'success'|'error'|''} [type='']
 */
export function showToast(message, type = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ` ${type}` : '');
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger removal after 3500ms with a 'hiding' class for CSS animation
  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Fallback removal in case transitionend never fires
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// ---------------------------------------------------------------------------
// Field error helpers
// ---------------------------------------------------------------------------

/**
 * Mark a form field as invalid and show an error message.
 * @param {string} errorId - The id of the error <span> element (e.g. 'item-type-error')
 * @param {string} message
 */
export function showFieldError(errorId, message) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
  const input = document.getElementById(errorId.replace(/-error$/, ''));
  if (input) input.classList.add('error');
}

/**
 * Clear a form field's error state.
 * @param {string} errorId - The id of the error <span> element (e.g. 'item-type-error')
 */
export function clearFieldError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.classList.remove('visible');
  const input = document.getElementById(errorId.replace(/-error$/, ''));
  if (input) input.classList.remove('error');
}

// ---------------------------------------------------------------------------
// Button loading state
// ---------------------------------------------------------------------------

/**
 * Put a button into a loading state with a spinner.
 * @param {HTMLButtonElement} btn
 * @param {string} loadingText
 */
export function setButtonLoading(btn, loadingText) {
  btn.disabled = true;
  btn.dataset.originalText = btn.innerHTML;
  btn.classList.add('btn-loading');
  btn.innerHTML = `<span class="spinner-sm"></span>${escapeHtml(loadingText)}`;
}

/**
 * Restore a button from its loading state.
 * @param {HTMLButtonElement} btn
 */
export function resetButton(btn) {
  btn.disabled = false;
  btn.classList.remove('btn-loading');
  if (btn.dataset.originalText !== undefined) {
    btn.innerHTML = btn.dataset.originalText;
  }
}

// ---------------------------------------------------------------------------
// HTML escaping
// ---------------------------------------------------------------------------

/**
 * Escape special HTML characters in a string.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape characters that are unsafe inside HTML attribute values.
 * @param {string} str
 * @returns {string}
 */
export function escapeAttr(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Avatar dropdown + logout (shared across pages)
// ---------------------------------------------------------------------------

/**
 * Wire up the avatar dropdown toggle and logout button.
 * @param {function(): Promise<void>} logoutFn  - e.g. `logout` from auth.js
 * @param {string} [redirectAfterLogout='index.html']
 */
export function initDropdownMenu(logoutFn, redirectAfterLogout = 'index.html') {
  const avatar   = document.getElementById('user-avatar');
  const dropdown = document.getElementById('avatar-dropdown');
  if (avatar && dropdown) {
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutFn();
      window.location.href = redirectAfterLogout;
    });
  }
}

// ---------------------------------------------------------------------------
// Nav auth state
// ---------------------------------------------------------------------------

/**
 * Update navigation elements to reflect the current auth state.
 * @param {import('firebase/auth').User|null} user
 * @param {function(import('firebase/auth').User|null): boolean} isAdminFn
 */
export function initNavAuth(user, isAdminFn) {
  const navLoggedOut = document.getElementById('nav-logged-out');
  const navLoggedIn = document.getElementById('nav-logged-in');
  const avatarInitial = document.getElementById('avatar-initial');
  const navAdminLink = document.getElementById('nav-admin-link');

  if (navLoggedOut) navLoggedOut.style.display = user ? 'none' : '';
  if (navLoggedIn) navLoggedIn.style.display = user ? 'flex' : 'none';

  if (avatarInitial && user) {
    const source = user.displayName || user.email || '';
    avatarInitial.textContent = source.charAt(0).toUpperCase();
  }

  if (navAdminLink) {
    navAdminLink.style.display = isAdminFn(user) ? '' : 'none';
  }
}
