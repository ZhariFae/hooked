import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtclo0qKfpU4gKsThIfRY2uwGfOq_umFg",
  authDomain: "hooked-3c636.firebaseapp.com",
  projectId: "hooked-3c636",
  storageBucket: "hooked-3c636.firebasestorage.app",
  messagingSenderId: "257269413666",
  appId: "1:257269413666:web:ff41d2b51573c76086d77b"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
