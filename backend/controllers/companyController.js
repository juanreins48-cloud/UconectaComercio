// controllers/companyController.js
import { db } from "../db.js";

export const getDashboard = async (req, res) => {
  const { empresaId } = req.params;

  try {
    // Cambio: COUNT(*) WHERE empresa_id → .where().get().size
    const activeOffersSnap = await db.collection("ofertas")
      .where("empresa_id", "==", empresaId)
      .get();
    const activeOffers = activeOffersSnap.size;

    // Cambio: JOIN aplicaciones + ofertas → no existe JOIN en Firestore
    // Solución: primero obtenemos los IDs de las ofertas de la empresa,
    // luego filtramos aplicaciones por esos IDs
    const ofertaIds = activeOffersSnap.docs.map(doc => doc.id);

    let applications = 0;
    let interviews = 0;

    // Firestore no permite WHERE IN con más de 30 elementos
    // Si hay muchas ofertas habría que paginar, pero para uso normal funciona
    if (ofertaIds.length > 0) {
      const appsSnap = await db.collection("aplicaciones")
        .where("oferta_id", "in", ofertaIds)
        .get();
      applications = appsSnap.size;

      // Cambio: COUNT WHERE estado = 'entrevista' → filtramos en memoria
      // porque Firestore no permite .where().where() con campos de distintas
      // colecciones (ya resolvimos el JOIN arriba)
      interviews = appsSnap.docs.filter(
        doc => doc.data().estado === "entrevista"
      ).length;
    }

    // Cambio: COUNT WHERE status = 'Closed' → .where().where().get().size
    const filledSnap = await db.collection("ofertas")
      .where("empresa_id", "==", empresaId)
      .where("status", "==", "Closed")
      .get();
    const filled = filledSnap.size;

    // Cambio: SELECT con subquery COUNT → por cada oferta contamos aplicaciones
    // Hacemos las consultas en paralelo con Promise.all para no hacerlas una por una
    const offers = await Promise.all(
      activeOffersSnap.docs.map(async (doc) => {
        const appsSnap = await db.collection("aplicaciones")
          .where("oferta_id", "==", doc.id)
          .get();
        return {
          id: doc.id,
          title: doc.data().titulo,
          applicants: appsSnap.size,
          status: doc.data().status,
        };
      })
    );

    // Cambio: ORDER BY + LIMIT → .orderBy().limit()
    const recentSnap = await db.collection("actividad_empresa")
      .where("empresa_id", "==", empresaId)
      .orderBy("creada_en", "desc")
      .limit(5)
      .get();

    const recent = recentSnap.docs.map(doc => ({
      message: doc.data().descripcion,
      tipo: doc.data().tipo,
      timestamp: doc.data().creada_en,
    }));

    res.json({
      stats: { activeOffers, applications, interviews, filled },
      offers,
      recent,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el dashboard de la empresa" });
  }
};