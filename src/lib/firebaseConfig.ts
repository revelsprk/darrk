import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0bBPJ15CQQmZyuDsOCN0USkxWg6xOXwI",
  authDomain: "yaju-chan.firebaseapp.com",
  projectId: "yaju-chan",
  storageBucket: "yaju-chan.firebasestorage.app",
  messagingSenderId: "302397767958",
  appId: "1:302397767958:web:9ebfb73617ce5dafea1037"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };