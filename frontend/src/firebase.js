// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP-Wuo4Qyx3MA3yM0GyqNTy6rwfqkrK_I",
  authDomain: "gym-management-e33ee.firebaseapp.com",
  projectId: "gym-management-e33ee",
  storageBucket: "gym-management-e33ee.appspot.com", // ✅ must be .appspot.com
  messagingSenderId: "110462518147",
  appId: "1:110462518147:web:c430e0928918f6b1e4ecb6"
};

// ✅ Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// ✅ Initialize Firestore
const db = getFirestore(app);

console.log("Firebase initialized with project:", firebaseConfig.projectId);

export { auth, db };