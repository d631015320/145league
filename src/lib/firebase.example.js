// src/lib/firebase.js 配置示例
// 复制此文件为 firebase.js 并填入你的 Firebase 配置
// 或者使用环境变量方式（推荐）

import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    updateDoc, 
    doc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    setDoc, 
    writeBatch 
} from "firebase/firestore";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";

// 方式一：直接配置（不推荐，会暴露密钥）
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// 方式二：使用环境变量（推荐）
// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID,
//     measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
// };

let app, db, auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase Init Error:", e);
}

export { db, auth };

export { 
    collection, addDoc, getDocs, getDoc, updateDoc, doc, 
    deleteDoc, onSnapshot, query, orderBy, setDoc, writeBatch, 
    signInWithEmailAndPassword, signOut, onAuthStateChanged 
};
