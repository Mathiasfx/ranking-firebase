"use client"
import { initializeApp } from "firebase/app"
import { getDatabase, ref } from "firebase/database"

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Tipos de juegos disponibles
export type GameType = 'memotest' | 'trivia';

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

// Función para obtener la referencia a un juego específico
export const getGameRef = (gameType: GameType) => {
  return ref(database, `games/${gameType}/usuarios`);
}

// Función de utilidad para validar la conexión
export const validateFirebaseConnection = () => {
  try {
    const db = getDatabase(app)
    return { success: true, database: db }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
