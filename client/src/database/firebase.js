import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAd8m8Fa9Du-38X3wnhVHnLlNRJcjN-y9o",
  authDomain: "this-is-where-it-begins.firebaseapp.com",
  projectId: "this-is-where-it-begins",
  storageBucket: "this-is-where-it-begins.firebasestorage.app",
  messagingSenderId: "760010210610",
  appId: "1:760010210610:web:64a10d2beccbfbcf052b2b",
  measurementId: "G-WKE7BQ76NP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);