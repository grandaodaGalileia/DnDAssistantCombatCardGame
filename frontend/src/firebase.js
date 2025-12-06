import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlWVJp5tyyBCIebSsvTB6FW6DUUmjhVJo",
  authDomain: "dnd-assistant-fd576.firebaseapp.com",
  projectId: "dnd-assistant-fd576",
  storageBucket: "dnd-assistant-fd576.firebasestorage.app",
  messagingSenderId: "957808107620",
  appId: "1:957808107620:web:4fbed400b67392ea613f71",
  measurementId: "G-6XFPM8WP9N",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const auth = getAuth(app);
export { db };
