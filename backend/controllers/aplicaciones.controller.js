// controllers/aplicaciones.controller.js
import { db } from "../db.js";

// ← Cambia este número si quieren otro límite de aplicaciones para usuarios free
const LIMITE_FREE = 3;

export async function applyInternship(req, res) {
  try {
    const { studentId, internshipId } = req.body;

    if (!studentId || !internshipId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Verificar si ya aplicó
    const existing = await db.collection("aplicaciones")
      .where("estudiante_id", "==", studentId)
      .where("oferta_id", "==", internshipId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    // Verificar límite de aplicaciones para estudiantes free
    const estudianteDoc = await db.collection("estudiantes").doc(studentId).get();
    const isPremium = estudianteDoc.exists ? (estudianteDoc.data().isPremium || false) : false;

    if (!isPremium) {
      const totalAplicaciones = await db.collection("aplicaciones")
        .where("estudiante_id", "==", studentId)
        .get();

      if (totalAplicaciones.size >= LIMITE_FREE) {
        return res.status(403).json({
          success: false,
          message: `Límite de ${LIMITE_FREE} aplicaciones alcanzado. Hazte Premium para aplicar sin límites.`,
          limitReached: true,
        });
      }
    }

    // Crear la aplicación
    await db.collection("aplicaciones").add({
      estudiante_id: studentId,
      oferta_id: internshipId,
      estado: "pendiente",
      creada_en: new Date(),
    });

    res.json({ success: true, message: "Application submitted successfully" });

  } catch (error) {
    console.error("ERROR applyInternship:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
