import { db } from "../db.js";

// Obtener notificaciones por estudiante
export async function getStudentNotifications(req, res) {
  try {
    const { studentId } = req.params;

    const snapshot = await db
      .collection("notificaciones_estudiante")
      .where("estudiante_id", "==", studentId)
      .orderBy("creada_en", "desc")
      .get();

    const rows = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      creada_en: doc.data().creada_en?.toDate().toISOString() ?? null,
    }));

    return res.json(rows);

  } catch (error) {
    console.error("ERROR getStudentNotifications:", error);
    res.status(500).json({ error: "Server error" });
  }
}

// Obtener notificaciones por universidad
export const getUniversityNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar la universidad asociada al usuario
    const uniSnapshot = await db
      .collection("universidades")
      .where("usuario_id", "==", userId)
      .limit(1)
      .get();

    if (uniSnapshot.empty) {
      return res.status(404).json({ error: "Universidad no encontrada" });
    }

    const universidadId = uniSnapshot.docs[0].id;

    const snapshot = await db
      .collection("notificaciones_universidad")
      .where("universidad_id", "==", universidadId)
      .orderBy("creada_en", "desc")
      .get();

    const notificaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      creada_en: doc.data().creada_en?.toDate().toISOString() ?? null,
    }));

    res.json({ notificaciones });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notificaciones" });
  }
};