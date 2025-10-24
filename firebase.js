import { initializeApp, getApps } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth, RecaptchaVerifier} from "firebase/auth";

   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
    apiKey: "AIzaSyDaXMaan6ddMKXUq8y0Z5Ei6e3-Ofq5U18",
    authDomain: "ecom-5efc6.firebaseapp.com",
    databaseURL: "https://ecom-5efc6-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ecom-5efc6",
    storageBucket: "ecom-5efc6.appspot.com",
    messagingSenderId: "908582468128",
    appId: "1:908582468128:web:b2efee3a63df039f685a45",
    measurementId: "G-SR38XLGDX3"
  };
   

   let app;
   if (!getApps().length) {
     app = initializeApp(firebaseConfig);
   } else {
     app = getApps()[0];
   }

   const auth = getAuth(app);
   const db = getFirestore(app);
   const storage = getStorage(app);

   export { auth, db, storage };