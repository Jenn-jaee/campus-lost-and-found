import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  documentId,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { extractKeywords } from './matching.js';

const COLLECTION = 'posts';

/**
 * Create a new lost/found post.
 * @param {Object} data - Post data matching the document shape (minus auto-fields).
 * @returns {Promise<string>} The new document ID.
 */
export async function createPost(data) {
  const keywords = extractKeywords(
    `${data.name} ${data.description} ${data.itemType} ${data.location}`
  );

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    keywords,
    status: data.type,
    matchedWith: null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Retrieve posts, optionally filtered by status.
 * @param {string|null} statusFilter - A status string, 'all', or null for no filter.
 * @returns {Promise<Array<{id: string}>>} Array of post objects with their doc IDs.
 */
export async function getPosts(statusFilter = null) {
  const postsRef = collection(db, COLLECTION);

  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(
      postsRef,
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(postsRef, orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
}

/**
 * Retrieve a single post by its document ID.
 * @param {string} id - The Firestore document ID.
 * @returns {Promise<{id: string}|null>} The post object, or null if not found.
 */
export async function getPostById(id) {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id };
}

/**
 * Update the status (and optionally matchedWith) of a post.
 * @param {string} id - The document ID to update.
 * @param {string} status - New status value.
 * @param {string|null} matchedWith - ID of the matched post, if any.
 */
export async function updatePostStatus(id, status, matchedWith = undefined) {
  const update = { status };
  if (matchedWith !== undefined) update.matchedWith = matchedWith;
  await updateDoc(doc(db, COLLECTION, id), update);
}

export async function cancelPost(id) {
  await updateDoc(doc(db, COLLECTION, id), { status: 'cancelled' });
}

/**
 * Fetch multiple posts by their document IDs in a single batched query.
 * Splits into chunks of 30 to stay within Firestore `in` limits.
 * @param {string[]} ids
 * @returns {Promise<Array<{id: string}>>}
 */
export async function getPostsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const postsRef = collection(db, COLLECTION);
  const chunks = [];
  for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
  const snaps = await Promise.all(
    chunks.map(chunk => getDocs(query(postsRef, where(documentId(), 'in', chunk))))
  );
  const posts = [];
  snaps.forEach(snap => snap.docs.forEach(d => posts.push({ ...d.data(), id: d.id })));
  return posts;
}

/**
 * Delete a post document.
 * @param {string} id - The document ID to delete.
 */
export async function deletePost(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Client-side full-text search across posts.
 * @param {string} queryStr - The search string.
 * @returns {Promise<Array<{id: string}>>} Filtered array of matching post objects.
 */
export async function searchPosts(queryStr) {
  if (!queryStr || typeof queryStr !== 'string') return [];
  const allPosts = await getPosts();
  const needle = queryStr.toLowerCase();

  return allPosts.filter((post) => {
    const haystack = [
      post.name,
      post.description,
      post.location,
      post.itemType,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  });
}
