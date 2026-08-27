import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// TODO: Replace with your actual Firebase project credentials
// Firebase Console → Project Settings → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZWdgyxAoZM3iolZU7t3Zh2iL7pQea2rI",
  authDomain: "campus-lost-and-found-ecaaf.firebaseapp.com",
  projectId: "campus-lost-and-found-ecaaf",
  storageBucket: "campus-lost-and-found-ecaaf.firebasestorage.app",
  messagingSenderId: "159531104886",
  appId: "1:159531104886:web:96daef1b77f91728e43d57"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
