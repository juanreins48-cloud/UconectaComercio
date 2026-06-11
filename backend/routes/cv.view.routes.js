import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET CV por estudiante_id
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    // Cambio: SELECT FROM cv_detalles → colección cv_estudiantes en Firestore
    const snap = await db.collection("cv_estudiantes")
      .where("estudiante_id", "==", studentId)
      .orderBy("actualizado_en", "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ success: false, message: "CV not found" });
    }

    return res.json({ success: true, cv: { id: snap.docs[0].id, ...snap.docs[0].data() } });

  } catch (err) {
    console.error("Error fetching CV:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;