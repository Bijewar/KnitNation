// verifyToken.js
const admin = require('./firebaseAdmin'); // Import the initialized Admin SDK

const verifyToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Token verified successfully:', decodedToken);
  } catch (error) {
    console.error('Error verifying token:', error);
  }
};

// Call verifyToken with an ID token
