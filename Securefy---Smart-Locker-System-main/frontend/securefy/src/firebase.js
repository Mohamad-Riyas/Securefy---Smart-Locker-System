// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZSTq0xY-Ah9BljJwm8kPoh6_5gtScZXg",
  authDomain: "fy-e4378.firebaseapp.com",
  projectId: "fy-e4378",
  storageBucket: "fy-e4378.firebasestorage.app",
  messagingSenderId: "1023769210293",
  appId: "1:1023769210293:web:ac2303cd062e30be0dfdfc",
  measurementId: "G-67NWY9Z3GG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;