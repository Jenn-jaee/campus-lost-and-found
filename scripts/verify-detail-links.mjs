/**
 * Smoke test: item-detail URLs must return 200 with ?id= preserved.
 * Run while `npm start` is active on localhost:3000.
 */
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PROJECT = 'campus-lost-and-found-ecaaf';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function head(url) {
  const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
  return { status: res.status, location: res.headers.get('location') };
}

const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/posts?pageSize=20`;
const data = await fetchJson(firestoreUrl);
const ids = (data.documents || []).map((d) => d.name.split('/').pop());

if (ids.length === 0) {
  console.error('No posts found in Firestore.');
  process.exit(1);
}

// Broken pattern (serve strips query on redirect)
const broken = await head(`${BASE}/item-detail.html?id=${ids[0]}`);
if (broken.status === 301 && broken.location === '/item-detail') {
  console.log('Note: item-detail.html?id= still redirects and drops query (use item-detail?id=).');
}

let failed = 0;
for (const id of ids) {
  const good = await head(`${BASE}/item-detail?id=${id}`);
  if (good.status !== 200) {
    console.error(`FAIL item-detail?id=${id} → ${good.status}`);
    failed++;
  }
}

if (failed) {
  console.error(`${failed}/${ids.length} detail URLs failed. Is npm start running?`);
  process.exit(1);
}

console.log(`OK: ${ids.length} item-detail?id= URLs return 200 on ${BASE}`);
