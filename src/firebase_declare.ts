// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATKe0SAEqV_Fj4O5Hf46-pH7aPbZCK2Y8",
  authDomain: "thecrag-b1b66.firebaseapp.com",
  projectId: "thecrag-b1b66",
  storageBucket: "thecrag-b1b66.appspot.com",
  messagingSenderId: "842192572799",
  appId: "1:842192572799:web:fe50c2dd4a4d5c10594a4a",
  measurementId: "G-BEJK6JM65C",
};

// TODO: Need to set up permissions

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
