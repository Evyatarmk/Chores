// FirebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// הגדרות Firebase שלך
const firebaseConfig = {
  apiKey: "AIzaSyAxBtI7tf2tw9KuWmWhM6BKpXAwop1ACYQ",
  authDomain: "chores-chat-44ca3.firebaseapp.com",
  projectId: "chores-chat-44ca3",
  storageBucket: "chores-chat-44ca3.firebasestorage.app",
  messagingSenderId: "98448787624",
  appId: "1:98448787624:web:741a4032367487db8b9a9d",
  measurementId: "G-X1R61GJQJK"
};

// אתחול האפליקציה
const app = initializeApp(firebaseConfig);

// חיבור ל־Auth ו־Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
