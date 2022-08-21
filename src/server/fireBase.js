import { initializeApp } from "firebase/app";
import { getFirestore , collection , onSnapshot , doc } from "firebase/firestore";
import { getAuth , signInWithPopup , GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import React, { useCallback, useEffect } from "react"
import {getDatabase} from "firebase/database"

/** !! fire base configs don't change them */   
const firebaseConfig = {
    apiKey: "AIzaSyCQEEwYS-WX9GJ5A0GKG3myWiJ0eKhy4aM",
    authDomain: "whatsapp-clone-83a15.firebaseapp.com",
    projectId: "whatsapp-clone-83a15",
    storageBucket: "whatsapp-clone-83a15.appspot.com",
    messagingSenderId: "822773554983",
    appId: "1:822773554983:web:80ca79f5c721906e5d1302",
    measurementId: "G-RM1F1PTKY6"
  };
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const dbDatabase = getDatabase(firebaseApp);
const googleAuth = new GoogleAuthProvider();
const Storage = getStorage(firebaseApp)
const auth = getAuth();

export default db ;
export {dbDatabase , Storage}
/** -------- */




