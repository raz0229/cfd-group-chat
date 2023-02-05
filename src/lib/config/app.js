import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA85a51Ia40gVbP6A0_SWt-sCusYye_Tu4",
    authDomain: "cfd-chat-16c3e.firebaseapp.com",
    projectId: "cfd-chat-16c3e",
    storageBucket: "cfd-chat-16c3e.appspot.com",
    messagingSenderId: "750066896039",
    appId: "1:750066896039:web:1943e1dda68dc9661f1f82"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
  