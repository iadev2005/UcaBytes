import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDMWnxWJKwz_PkQTx22tKgBMSEA7NYzhRk",
  authDomain: "venpyme-311d0.firebaseapp.com",
  projectId: "venpyme-311d0",
  storageBucket: "venpyme-311d0.appspot.com",
  messagingSenderId: "815646928166",
  appId: "1:815646928166:web:eddfef58ff126ccfd2a5e7",
  measurementId: "G-CREK10K33D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); 