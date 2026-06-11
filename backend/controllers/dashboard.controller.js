// controllers/dashboard.controller.js
import { db } from '../db.js';

// =======================================
// WIDGETS
// =======================================

// Cambio: pool.query INSERT → db.collection().add()
// Firestore genera el ID automáticamente, no hay insertId
export async function createWidget(req, res, next) {
  try {
    const { title, config, data } = req.body;
    const owner_id = req.user.id;
    const ref = await db.collection('widgets').add({
      title,
      config: config || null,
      data: data || null,
      owner_id,
      created_at: new Date(),
    });
    res.status(201).json({ id: ref.id, title });
  } catch (err) { next(err); }
}

// Cambio: pool.query SELECT → db.collection().get()
// Firestore no tiene JSON stringify/parse — los objetos se guardan nativos
export async function listWidgets(req, res, next) {
  try {
    const snapshot = await db.collection('widgets').get();
    const widgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(widgets);
  } catch (err) { next(err); }
}

// Cambio: SELECT WHERE id → db.collection().doc(id).get()
export async function getWidget(req, res, next) {
  try {
    const doc = await db.collection('widgets').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) { next(err); }
}

// Cambio: UPDATE → doc.ref.update()
export async function updateWidget(req, res, next) {
  try {
    const { title, config, data } = req.body;
    await db.collection('widgets').doc(req.params.id).update({
      title,
      config: config || null,
      data: data || null,
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// Cambio: DELETE → doc.ref.delete()
export async function deleteWidget(req, res, next) {
  try {
    await db.collection('widgets').doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// =======================================
// DASHBOARD ESTUDIANTE
// =======================================

export async function getStudentDashboard(req, res) {
  const { userId } = req.params;

  try {
    // Cambio: SELECT FROM estudiantes WHERE usuario_id → doc(userId).get()
    // En auth.controller.js guardamos el doc del estudiante con el mismo ID del usuario
    const studentDoc = await db.collection('estudiantes').doc(userId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Cambio: COUNT(*) no existe en Firestore → traemos la colección y contamos con .size
    const aplicacionesSnap = await db.collection('aplicaciones')
      .where('estudiante_id', '==', userId).get();
    const applications = aplicacionesSnap.size;

    const entrevistasSnap = await db.collection('aplicaciones')
      .where('estudiante_id', '==', userId)
      .where('estado', '==', 'entrevista').get();
    const interviews = entrevistasSnap.size;

    const aceptadosSnap = await db.collection('aplicaciones')
      .where('estudiante_id', '==', userId)
      .where('estado', '==', 'aceptado').get();
    const recommendations = aceptadosSnap.size;

    const vistasSnap = await db.collection('vistas_perfil')
      .where('estudiante_id', '==', userId).get();
    const views = vistasSnap.size;

    // Cambio: ORDER BY + LIMIT → orderBy().limit() en Firestore
    // Requiere índice en Firestore (se crea automáticamente la primera vez)
    const recentSnap = await db.collection('actividad_estudiante')
      .where('estudiante_id', '==', userId)
      .orderBy('creada_en', 'desc')
      .limit(5).get();

    const recent = recentSnap.docs.map(doc => ({
      title: doc.data().titulo,
      time: doc.data().tiempo,
    }));

    return res.json({
      stats: { applications, interviews, recommendations, views },
      recent,
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// =======================================
// DASHBOARD UNIVERSIDAD
// =======================================

export async function getUniversityDashboard(req, res) {
  try {
    const { userId } = req.params;

    // Cambio: SELECT FROM universidades WHERE usuario_id → doc(userId).get()
    const uniDoc = await db.collection('universidades').doc(userId).get();
    if (!uniDoc.exists) {
      return res.status(400).json({ success: false, message: "University not found" });
    }

    // Cambio: COUNT(*) → .get().size en cada colección
    const studentsSnap = await db.collection('estudiantes').get();
    const companiesSnap = await db.collection('empresas').get();

    const internshipsSnap = await db.collection('ofertas')
      .where('status', '==', 'Active').get();

    const totalAppsSnap = await db.collection('aplicaciones').get();
    const aceptadosSnap = await db.collection('aplicaciones')
      .where('estado', '==', 'aceptado').get();

    const totalApps = totalAppsSnap.size;
    const accepted = aceptadosSnap.size;
    const successRate = totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;

    const recentSnap = await db.collection('actividad_empresa')
      .orderBy('creada_en', 'desc')
      .limit(5).get();

    const recent = recentSnap.docs.map(doc => ({
      descripcion: doc.data().descripcion,
      creada_en: doc.data().creada_en,
    }));

    return res.json({
      success: true,
      stats: {
        students: studentsSnap.size,
        companies: companiesSnap.size,
        internships: internshipsSnap.size,
        successRate,
      },
      recent,
    });

  } catch (error) {
    console.error("ERROR getUniversityDashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}