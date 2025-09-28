import * as admin from "firebase-admin";

let app: admin.app.App;

interface FirebaseServiceAccount extends admin.ServiceAccount {
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

function loadServiceAccount(): FirebaseServiceAccount | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (base64) {
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(decoded) as FirebaseServiceAccount;
  }

  if (raw) {
    return JSON.parse(raw) as FirebaseServiceAccount;
  }

  return null;
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
  if (!serviceAccount) {
    throw new Error("Firebase service account is not set or invalid");
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  app = admin.app();
}

export const authAdmin = admin.auth(app);
