import { db } from './firebase-config.js';
import {
  updateDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'my', 'i', 'was', 'near',
  'some', 'have', 'had', 'this', 'that', 'item', 'lost', 'found'
]);

/**
 * Extract meaningful keywords from a text string.
 * Lowercases, strips non-alphanumeric characters, splits on whitespace,
 * and removes stop words and short tokens.
 * @param {string} text
 * @returns {string[]}
 */
export function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));
}

/**
 * Compute Jaccard similarity between two arrays of keywords.
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number} Value between 0 and 1
 */
function jaccardSimilarity(a, b) {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersectionSize = 0;
  for (const word of setA) {
    if (setB.has(word)) intersectionSize++;
  }
  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Find the best matching post from a list of all posts for a given new post.
 * Matches are only considered from the opposite status type (lost vs found),
 * must share the same itemType, and must have a minimum Jaccard score of 0.2.
 * @param {{ id: string, status: string, itemType: string, keywords: string[] }} newPost
 * @param {Array<{ id: string, status: string, itemType: string, keywords: string[] }>} allPosts
 * @returns {{ id: string, status: string, itemType: string, keywords: string[] }|null}
 */
export function findMatch(newPost, allPosts) {
  const oppositeType = newPost.status === 'lost' ? 'found' : 'lost';

  const candidates = allPosts.filter(
    post =>
      post.status === oppositeType &&
      post.itemType === newPost.itemType &&
      post.id !== newPost.id
  );

  let bestMatch = null;
  let bestScore = 0.2; // minimum threshold

  const newKeywords = newPost.keywords || extractKeywords(newPost.description || '');

  for (const candidate of candidates) {
    const candidateKeywords = candidate.keywords || extractKeywords(candidate.description || '');
    const score = jaccardSimilarity(newKeywords, candidateKeywords);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

/**
 * Run the matching algorithm for a newly submitted post and, if a match is
 * found, update both posts in Firestore with status='matched' and a cross-reference.
 * @param {{ id: string, status: string, itemType: string, keywords: string[] }} newPost
 * @param {Array<{ id: string, status: string, itemType: string, keywords: string[] }>} allPosts
 * @returns {Promise<string|null>} The matched post's id, or null if no match found
 */
export async function runMatching(newPost, allPosts) {
  const match = findMatch(newPost, allPosts);
  if (!match) return null;

  const newPostRef = doc(db, 'posts', newPost.id);
  const matchedPostRef = doc(db, 'posts', match.id);

  // Only flag the cross-reference — do NOT change status.
  // Status stays 'lost' or 'found' so claims remain open.
  await Promise.all([
    updateDoc(newPostRef, { matchedWith: match.id }),
    updateDoc(matchedPostRef, { matchedWith: newPost.id })
  ]);

  return match.id;
}
