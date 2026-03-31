import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push, remove, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDjfXaFBOL3z4jVXuqjXiIexJZjtte_r_E",
  authDomain: "velizade-80076.firebaseapp.com",
  databaseURL: "https://velizade-80076-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "velizade-80076",
  storageBucket: "velizade-80076.firebasestorage.app",
  messagingSenderId: "700127068755",
  appId: "1:700127068755:web:3aca2b023b32bfca837ca6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and Storage
const db = getDatabase(app);
const storage = getStorage(app);

export { db, ref, set, get, child, push, remove, update, storage, storageRef, uploadBytes, getDownloadURL };
