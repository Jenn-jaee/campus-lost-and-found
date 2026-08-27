import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { updatePostStatus } from './posts.js';

const COLLECTION = 'claims';

/**
 * Create a new claim for a post and mark the post as 'claimed'.
 * @param {string} postId - The ID of the post being claimed.
 * @param {{ uid: string, email: string, displayName: string }} user - The claiming user.
 * @returns {Promise<string>} The new claim document ID.
 */
export async function createClaim(postId, user, ownershipNote = '') {
  const docRef = await addDoc(collection(db, COLLECTION), {
    postId,
    userId: user.uid,
    userEmail: user.email,
    userName: user.displayName || user.email,
    ownershipNote,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  await updatePostStatus(postId, 'under-review');

  return docRef.id;
}

/**
 * Get all claims submitted by a specific user.
 * @param {string} userId - The user's UID.
 * @returns {Promise<Array<{id: string}>>} Array of claim objects.
 */
export async function getUserClaims(userId) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  results.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? new Date(a.createdAt ?? 0).getTime();
    const tb = b.createdAt?.toMillis?.() ?? new Date(b.createdAt ?? 0).getTime();
    return tb - ta;
  });
  return results;
}

/**
 * Get all claims associated with a specific post.
 * @param {string} postId - The post's document ID.
 * @returns {Promise<Array<{id: string}>>} Array of claim objects.
 */
export async function getClaimsForPost(postId) {
  const q = query(
    collection(db, COLLECTION),
    where('postId', '==', postId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update the status of a claim document.
 * @param {string} claimId - The claim document ID.
 * @param {string} status - New status ('pending' | 'confirmed' | 'dismissed').
 */
export async function updateClaimStatus(claimId, status) {
  await updateDoc(doc(db, COLLECTION, claimId), { status });
}

/**
 * Confirm one claim as the rightful owner; dismiss all other claims for the same post.
 * Sets the post status to 'claimed'.
 * @param {string} claimId - The winning claim's document ID.
 * @param {string} postId - The post's document ID.
 */
export async function confirmClaim(claimId, postId) {
  const claims = await getClaimsForPost(postId);
  await Promise.all(
    claims.map(c => updateClaimStatus(c.id, c.id === claimId ? 'confirmed' : 'dismissed'))
  );
  await updatePostStatus(postId, 'claimed');
}
