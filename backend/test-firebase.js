import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function test() {
  try {
    await db.collection("test").doc("ping").set({ ping: "pong" });
    console.log("✅ Conexión correcta y escritura exitosa");
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  }
}

test();
