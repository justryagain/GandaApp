import * as admin from "firebase-admin";

let app: admin.app.App;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!admin.apps.length) {
  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  app = admin.app();
}

export const authAdmin = admin.auth(app);
