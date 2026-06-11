import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GUARDAR CV
router.post("/", async (req, res) => {
  try {
    const { studentId, fullName, email, phone, summary, experience, education, skills } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    // Cambio: SELECT FROM estudiantes WHERE id → .doc(studentId).get()
    const estudianteDoc = await db.collection("estudiantes").doc(studentId).get();
    if (!estudianteDoc.exists) {
      return res.status(400).json({ success: false, message: "Student not found" });
    }

    // Cambio: INSERT INTO cv_estudiantes → .add()
    // Guardamos actualizado_en para poder ordenar y obtener el más reciente
   await db.collection("cv_estudiantes").add({
  estudiante_id: studentId,
  full_name: fullName || "",
  email: email || "",
  phone: phone || "",
  summary: summary || "",
  experience: experience || "",
  education: education || "",
  skills: skills || "",
  actualizado_en: new Date(),
});

    return res.json({ success: true, message: "CV saved successfully" });

  } catch (err) {
    console.error("Saving CV error:", err);
    return res.status(500).json({ success: false, message: "Error saving CV" });
  }
});

// VER CV DETALLADO — va PRIMERO
router.get("/view/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const snap = await db.collection("cv_estudiantes")
  .where("estudiante_id", "==", studentId)
  .orderBy("actualizado_en", "desc")  // <- restaurar
  .limit(1)
  .get();

    if (snap.empty) {
      return res.status(404).json({ success: false, message: "CV not found" });
    }

    // Cambio: en vez de orderBy (requiere índice), ordenamos en memoria
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const latest = docs.sort((a, b) => b.actualizado_en - a.actualizado_en)[0];

    return res.json({ success: true, cv: latest });

  } catch (err) {
    console.error("Fetching CV error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// OBTENER CV MÁS RECIENTE — va DESPUÉS
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const snap = await db.collection("cv_estudiantes")
      .where("estudiante_id", "==", studentId)
      .get();

    if (snap.empty) {
      return res.status(404).json({ success: false, message: "CV not found" });
    }

    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const latest = docs.sort((a, b) => b.actualizado_en - a.actualizado_en)[0];

    return res.json({ success: true, cv: latest });

  } catch (err) {
    console.error("Fetching CV error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;