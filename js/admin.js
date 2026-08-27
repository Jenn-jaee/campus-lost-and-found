import { getPosts, updatePostStatus, deletePost, getPostById } from './posts.js';
import { serverTimestamp, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db } from './firebase-config.js';
export { getClaimsForPost, confirmClaim } from './claims.js';

/**
 * Fetch every post regardless of status.
 * @returns {Promise<Array<{id: string}>>} All post objects.
 */
export async function getAllPosts() {
  return getPosts();
}

/**
 * Mark a post as resolved.
 * @param {string} postId - The document ID of the post to resolve.
 */
export async function resolvePost(postId) {
  await updateDoc(doc(db, 'posts', postId), { status: 'resolved', resolvedAt: serverTimestamp() });
}

/**
 * Delete a post (admin action).
 * @param {string} postId - The document ID of the post to delete.
 */
export async function adminDeletePost(postId) {
  try {
    const post = await getPostById(postId);
    if (post?.matchedWith) {
      const partner = await getPostById(post.matchedWith);
      if (partner) {
        await updatePostStatus(partner.id, partner.type || 'found', null);
      }
    }
  } catch (_) {}
  return deletePost(postId);
}

/**
 * Return dashboard counts broken down by post status.
 * @returns {Promise<{ active: number, matched: number, claimed: number, resolved: number }>}
 */
export async function getAdminCounts() {
  const posts = await getAllPosts();

  return {
    active: posts.filter((p) => p.status === 'lost' || p.status === 'found').length,
    matched: posts.filter((p) => p.status === 'matched').length,
    claimed: posts.filter((p) => p.status === 'claimed').length,
    resolved: posts.filter((p) => p.status === 'resolved').length,
  };
}
