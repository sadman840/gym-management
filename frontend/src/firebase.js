
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAnfsPY6Hs1WfNLWoD6H-sBKCRS0VMN7LE",
  authDomain: "gym-management-f71ea.firebaseapp.com",
  projectId: "gym-management-f71ea",
  storageBucket: "gym-management-f71ea.appspot.com",
  messagingSenderId: "328150317129",
  appId: "1:328150317129:web:6f5f6ef73a8bf7d8fba798",
  measurementId: "G-LRGQ89YETH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  getAnalytics(app);
}