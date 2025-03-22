import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtmc2YfaogNKiSRIuEK8meeMFEKdUUoIY",
  authDomain: "techtylists.firebaseapp.com",
  projectId: "techtylists",
  storageBucket: "techtylists.firebasestorage.app",
  messagingSenderId: "598986208371",
  appId: "1:598986208371:web:51c4cc1261747c1be7e606",
  measurementId: "G-0Z1KKES99D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { app, db }; // Export both app and db

