import { defineConfig } from "cypress";
import admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" }) || dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
    ),
  });
}

type FirebaseAuthError = Error & { code?: string };

export default defineConfig({
  e2e: {
    env: {
      APP_ENV: process.env.APP_ENV,
    },
    baseUrl: process.env.APP_URL,
    testIsolation: true,
    setupNodeEvents(on, _config) {
      on("task", {
        async deleteFirebaseUser(email: string) {
          try {
            const user = await admin.auth().getUserByEmail(email);
            await admin.auth().deleteUser(user.uid);
            return { success: true };
          } catch (err) {
            if (err instanceof Error) {
              const fbErr = err as FirebaseAuthError;

              if (fbErr.code === "auth/user-not-found") {
                return { success: true, skipped: true };
              }

              return { success: false, error: err.message };
            }

            return { success: false, error: String(err) };
          }
        },
      });
    },
  },
});