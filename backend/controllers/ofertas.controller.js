// controllers/ofertas.controller.js
import { db } from "../db.js";

// =====================
// GET todas las ofertas activas
// =====================
export async function getOfertas(req, res) {
  try {
    // Cambio: quitamos orderBy para evitar requerimiento de índice
    // ordenamos en memoria después
    const ofertasSnap = await db.collection("ofertas")
      .where("status", "==", "Active")
      .orderBy("creada_en", "desc")
      .get();

    const ofertas = (await Promise.all(
  ofertasSnap.docs.map(async (doc) => {
    const data = doc.data();

    

    let company = "Unknown company";
    const empresaDoc = await db.collection("empresas").doc(data.empresa_id).get();
    company = empresaDoc.exists ? empresaDoc.data().nombre_empresa : "Unknown company";

    return {
      id: doc.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      modalidad: data.modalidad,
      remuneracion: data.remuneracion,
      isPremium: data.isPremium || false,
      creada_en: data.creada_en,
      company,
    };
  })
))
 
    // Ordenar en memoria: premium primero, luego por fecha
    const sorted = ofertas.sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      return b.creada_en - a.creada_en;
    });

    res.json({ success: true, ofertas: sorted });

  } catch (error) {
    console.error("ERROR getOfertas:", error);
    res.status(500).json({ success: false, message: "Error fetching offers" });
  }
  
}


// =====================
// POST nueva oferta
// =====================
export async function createOffer(req, res) {
  try {
    const {
      empresaId,
      titulo,
      descripcion,
      requisitos,
      ubicacion,
      modalidad = "presencial",
      remuneracion,
    } = req.body;

    if (!empresaId || !titulo || !descripcion) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Cambio: INSERT INTO ofertas → .add()
    // isPremium depende de si la empresa tiene plan premium
    const empresaDoc = await db.collection("empresas").doc(empresaId).get();
    const isPremium = empresaDoc.exists ? empresaDoc.data().isPremium || false : false;

    const ofertaRef = await db.collection("ofertas").add({
      empresa_id: empresaId,
      titulo,
      descripcion,
      requisitos: requisitos || "",
      ubicacion: ubicacion || "",
      modalidad,
      remuneracion: remuneracion || "",
      status: "Active",
      isPremium, // <- se hereda del plan de la empresa automáticamente
      creada_en: new Date(),
    });

    // Cambio: INSERT INTO actividad_empresa → .add()
    await db.collection("actividad_empresa").add({
      empresa_id: empresaId,
      descripcion: `Nueva oferta publicada: ${titulo}`,
      tipo: "nueva_oferta",
      creada_en: new Date(),
    });

    res.json({
      success: true,
      message: "Oferta creada correctamente",
      ofertaId: ofertaRef.id,
    });

  } catch (err) {
    console.error("ERROR createOffer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}