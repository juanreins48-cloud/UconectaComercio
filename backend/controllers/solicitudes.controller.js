// controllers/solicitudes.controller.js
import { db } from "../db.js";

// ---------------------------------------------
// Estudiante aplica a una oferta
// ---------------------------------------------
export async function applyInternship(req, res) {
  try {
    const { studentId, internshipId } = req.body;

    if (!studentId || !internshipId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Cambio: SELECT WHERE dos campos → .where().where().get()
    const existing = await db.collection("aplicaciones")
      .where("estudiante_id", "==", studentId)
      .where("oferta_id", "==", internshipId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    // Cambio: SELECT FROM ofertas WHERE id → .doc(id).get()
    const ofertaDoc = await db.collection("ofertas").doc(internshipId).get();
    if (!ofertaDoc.exists) {
      return res.status(400).json({ success: false, message: "Offer not found" });
    }

    const { empresa_id: empresaId, titulo } = ofertaDoc.data();

    // Cambio: INSERT INTO aplicaciones → .add()
    await db.collection("aplicaciones").add({
      estudiante_id: studentId,
      oferta_id: internshipId,
      estado: "pendiente",
      creada_en: new Date(),
    });

    // Cambio: INSERT INTO actividad_empresa → .add()
    await db.collection("actividad_empresa").add({
      empresa_id: empresaId,
      descripcion: `Nueva aplicación recibida para ${titulo}`,
      tipo: "nueva_aplicacion",
      creada_en: new Date(),
    });

    res.json({ success: true, message: "Application submitted successfully" });

  } catch (error) {
    console.error("ERROR applyInternship:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ---------------------------------------------
// Obtener aplicaciones que recibió una empresa
// ---------------------------------------------
export async function getApplicationsByCompany(req, res) {
  try {
    const { empresaId } = req.params;

    // Paso 1: ofertas de esta empresa
    const ofertasSnap = await db.collection("ofertas")
      .where("empresa_id", "==", empresaId)
      .get();

    if (ofertasSnap.empty) {
      return res.json({ success: true, data: [] });
    }

    const ofertasMap = {};
    ofertasSnap.docs.forEach(doc => {
      ofertasMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    const ofertaIds = Object.keys(ofertasMap);

    // Paso 2: aplicaciones a esas ofertas
    const appsSnap = await db.collection("aplicaciones")
      .where("oferta_id", "in", ofertaIds)
      .orderBy("creada_en", "desc")
      .get();

    if (appsSnap.empty) {
      return res.json({ success: true, data: [] });
    }

    // Paso 3: para cada aplicación traemos estudiante, usuario y CV en paralelo
    const data = await Promise.all(
      appsSnap.docs.map(async (appDoc) => {
        const app = appDoc.data();

        // Datos del estudiante
        const estudianteDoc = await db.collection("estudiantes")
          .doc(app.estudiante_id).get();
        const estudiante = estudianteDoc.exists ? estudianteDoc.data() : {};

        // Datos del usuario (nombre, email)
        const usuarioDoc = await db.collection("usuarios")
          .doc(app.estudiante_id).get();
        const usuario = usuarioDoc.exists ? usuarioDoc.data() : {};

        // CV más reciente del estudiante
        const cvSnap = await db.collection("cv_estudiantes")
          .where("estudiante_id", "==", app.estudiante_id)
          .orderBy("actualizado_en", "desc")
          .limit(1)
          .get();

        const cv = cvSnap.empty ? {} : cvSnap.docs[0].data();

        const oferta = ofertasMap[app.oferta_id] || {};

        return {
          aplicacion_id: appDoc.id,
          estado: app.estado,
          creada_en: app.creada_en,
          estudiante_id: app.estudiante_id,
          estudiante_nombre: usuario.nombre || "",
          estudiante_email: usuario.email || "",
          oferta_id: app.oferta_id,
          oferta_titulo: oferta.titulo || "",
          full_name: cv.full_name || "",
          email: cv.email || usuario.email || "",
          phone: cv.phone || "N/A",
          summary: cv.summary || "",
          experience: cv.experience || "",
          education: cv.education || "",
          skills: cv.skills || "",
          isPremium: estudiante.isPremium || false,
        };
      })
    );

    return res.json({ success: true, data });

  } catch (error) {
    console.error("ERROR getApplicationsByCompany:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
// ---------------------------------------------
// Cambiar estado de una aplicación + notificación
// ---------------------------------------------
export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, mensaje } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Missing status" });
    }

    // Cambio: SELECT FROM aplicaciones WHERE id → .doc(id).get()
    const appDoc = await db.collection("aplicaciones").doc(id).get();
    if (!appDoc.exists) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const { estudiante_id: estudianteId, oferta_id: ofertaId } = appDoc.data();

    // Cambio: SELECT FROM ofertas WHERE id → .doc(id).get()
    const ofertaDoc = await db.collection("ofertas").doc(ofertaId).get();
    const tituloOferta = ofertaDoc.exists ? ofertaDoc.data().titulo : "una oferta";

    // Cambio: UPDATE aplicaciones SET estado → .doc(id).update()
    await db.collection("aplicaciones").doc(id).update({ estado: status });

    // Construir mensaje de notificación
    let mensajeNotificacion = "";

    if (status === "aceptado") {
      mensajeNotificacion = `¡Felicidades! Has sido ACEPTADO en la pasantía: ${tituloOferta}.\n\n`;
      mensajeNotificacion += mensaje?.trim()
        ? `Mensaje de la empresa:\n"${mensaje}"`
        : "La empresa pronto se pondrá en contacto contigo para continuar con el proceso.";
    }

    if (status === "rechazado") {
      mensajeNotificacion = `Tu aplicación a la pasantía ${tituloOferta} ha sido rechazada.\n\n`;
      mensajeNotificacion += "Sigue intentándolo, ¡nuevas oportunidades vienen pronto!";
    }

    // Cambio: INSERT INTO notificaciones_estudiante → .add()
    await db.collection("notificaciones_estudiante").add({
      estudiante_id: estudianteId,
      mensaje: mensajeNotificacion,
      leida: false,
      creada_en: new Date(),
    });

    return res.json({ success: true, message: "Status updated + notification sent" });

  } catch (error) {
    console.error("ERROR updateApplicationStatus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}