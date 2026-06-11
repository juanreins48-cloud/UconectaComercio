// routes/testdb.js
import express from "express";
import { db } from "../db.js"; // Firestore

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // simple ping: leer un documento dummy
    await db.collection("ping").doc("test").set({ time: new Date() });

    res.json({
      success: true,
      message: "🔥 Firestore connection OK"
    });
  } catch (error) {
    console.error("Firestore TEST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Firestore connection FAILED",
      error: error.message,
    });
  }
});

export default router;
