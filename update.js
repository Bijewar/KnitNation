// updateUIDs.js

import { db } from '../fire/firebase'; // Import your Firestore instance
import { collection, getDocs, query, updateDoc, doc } from 'firebase/firestore';

const updateUIDs = async () => {
  try {
    // Query Firestore for documents where UID does not match
    const q = query(collection(db, 'users')); // Update 'users' to your collection name if different
    const querySnapshot = await getDocs(q);

    // Iterate over the documents
    querySnapshot.forEach(async (doc) => {
      const userData = doc.data();
      const storedUID = userData.uid; // Assuming you have stored UID in the document

      // Check if stored UID matches the UID assigned by Firebase Authentication
      if (storedUID !== doc.id) {
        // If UID mismatch, update the document with the correct UID
        const userDocRef = doc(db, 'users', doc.id); // Assuming 'users' is your collection name
        await updateDoc(userDocRef, { uid: doc.id });

        console.log(`Updated UID for document ${doc.id}`);
      }
    });

    console.log('UIDs updated successfully');
  } catch (error) {
    console.error('Error updating UIDs:', error);
  }
};

// Call the function to update UIDs
updateUIDs();
