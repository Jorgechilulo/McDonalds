// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// IMPORTANTE: Adicionado o getAuth para funcionar a autenticação real
import { getAuth } from "firebase/auth"; 
// CORREÇÃO: Importar o Firestore para corrigir o erro do 'db'
import { getFirestore } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhdrI7Lpf_zddGS7VT2fALUClJtQ3syd4",
  authDomain: "mcdonalds-b5106.firebaseapp.com",
  projectId: "mcdonalds-b5106",
  storageBucket: "mcdonalds-b5106.firebasestorage.app",
  messagingSenderId: "252853131341",
  appId: "1:252853131341:web:74e1de608892a7b0a1a404",
  measurementId: "G-8RGVSG1WZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// IMPORTANTE: Inicializa e EXPORTA o auth para o seu App.jsx usar
export const auth = getAuth(app);

// CORREÇÃO: Inicializa e EXPORTA o db (Firestore) para corrigir a tela branca do seu App.jsx
export const db = getFirestore(app);