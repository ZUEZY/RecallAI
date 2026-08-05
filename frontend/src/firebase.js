import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB91gBUERYo2EHyFNOBjhYSObo21qcI0Iw",
  authDomain: "recallai-a7db9.firebaseapp.com",
  projectId: "recallai-a7db9",
  storageBucket: "recallai-a7db9.firebasestorage.app",
  messagingSenderId: "916365563453",
  appId: "1:916365563453:web:3d44fd36de1c15aa33bc54",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);