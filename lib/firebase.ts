// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyA1jApITKlVyD1QzT31e-1ZC64kCpYOQAg",
    authDomain: "expensetracker2061.firebaseapp.com",
    projectId: "expensetracker2061",
    storageBucket: "expensetracker2061.firebasestorage.app",
    messagingSenderId: "137929573868",
    appId: "1:137929573868:web:322f862a6b1f5a95a1acc9"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
