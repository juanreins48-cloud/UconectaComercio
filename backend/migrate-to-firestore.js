// migrate-to-firestore.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { firestore, adminSDK, bucket } from "./firebase.js";
dotenv.config();

const BATCH_SIZE = 400;

// Convierte valores MySQL a plain JS + Firestore types
function normalizeRow(row) {
  const obj = {};
  for (const k of Object.keys(row)) {
    const v = row[k];
    // convert MySQL Date -> Firestore Timestamp
    if (v instanceof Date) {
      obj[k] = adminSDK.firestore.Timestamp.fromDate(v);
    } else {
      obj[k] = v;
    }
  }
  return obj;
}

async function writeBatchDocs(collectionName, rows, idField = "id") {
  if (!rows || rows.length === 0) {
    console.log(`-> ${collectionName}: 0 rows`);
    return;
  }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const batch = firestore.batch();
    for (const row of chunk) {
      const docId = String(row[idField]);
      const docRef = firestore.collection(collectionName).doc(docId);
      batch.set(docRef, normalizeRow(row), { merge: true });
    }
    await batch.commit();
    console.log(`Committed ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} to ${collectionName}`);
  }
}

async function migrate() {
  console.log("Starting migration to Firestore...");
  const mysqlConn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
  });

  try {
    // 1) usuarios
    {
      const [rows] = await mysqlConn.query("SELECT * FROM usuarios");
      // map created_at -> createdAt (Firestore style) and remove sensitive transformation if needed
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.created_at) copy.createdAt = adminSDK.firestore.Timestamp.fromDate(new Date(copy.created_at));
        delete copy.created_at;
        // keep password as-is (hash). Optionally rename
        copy.passwordHash = copy.password;
        delete copy.password;
        return copy;
      });
      await writeBatchDocs("usuarios", mapped);
    }

    // 2) estudiantes
    {
      const [rows] = await mysqlConn.query("SELECT * FROM estudiantes");
      const mapped = rows.map(r => ({ ...r }));
      await writeBatchDocs("estudiantes", mapped);
    }

    // 3) empresas
    {
      const [rows] = await mysqlConn.query("SELECT * FROM empresas");
      await writeBatchDocs("empresas", rows);
    }

    // 4) universidades
    {
      const [rows] = await mysqlConn.query("SELECT * FROM universidades");
      await writeBatchDocs("universidades", rows);
    }

    // 5) ofertas
    {
      const [rows] = await mysqlConn.query("SELECT * FROM ofertas");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.creada_en) copy.creadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.creada_en));
        delete copy.creada_en;
        // keep empresaId as string for consistency
        copy.empresaId = String(copy.empresa_id);
        delete copy.empresa_id;
        if (copy.status) copy.status = copy.status;
        return copy;
      });
      await writeBatchDocs("ofertas", mapped);
      // Also create subcollections ofertas/{id}/aplicaciones placeholder is handled later
    }

    // 6) aplicaciones
    {
      const [rows] = await mysqlConn.query("SELECT * FROM aplicaciones");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.creada_en) copy.creadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.creada_en));
        delete copy.creada_en;
        copy.estudianteId = String(copy.estudiante_id);
        copy.ofertaId = String(copy.oferta_id);
        delete copy.estudiante_id;
        delete copy.oferta_id;
        return copy;
      });
      await writeBatchDocs("aplicaciones", mapped);

      // OPTIONAL: write aplicación also as subdoc under estudiante and oferta for fast queries
      for (const ap of mapped) {
        const appId = String(ap.id);
        const estudianteRef = firestore.collection("estudiantes").doc(String(ap.estudianteId)).collection("aplicaciones").doc(appId);
        const ofertaRef = firestore.collection("ofertas").doc(String(ap.ofertaId)).collection("aplicaciones").doc(appId);
        // set minimal denormalized view to avoid heavy reads
        const denorm = {
          id: appId,
          estudianteId: ap.estudianteId,
          ofertaId: ap.ofertaId,
          estado: ap.estado,
          creadaEn: ap.creadaEn || adminSDK.firestore.FieldValue.serverTimestamp()
        };
        await estudianteRef.set(denorm, { merge: true });
        await ofertaRef.set(denorm, { merge: true });
      }
      console.log("Wrote aplicaciones and subcollections");
    }

    // 7) actividad_estudiante
    {
      const [rows] = await mysqlConn.query("SELECT * FROM actividad_estudiante");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.creada_en) copy.creadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.creada_en));
        delete copy.creada_en;
        copy.estudianteId = String(copy.estudiante_id);
        delete copy.estudiante_id;
        return copy;
      });
      await writeBatchDocs("actividad_estudiante", mapped);
      // also as subcollections
      for (const item of mapped) {
        const docRef = firestore.collection("estudiantes").doc(String(item.estudianteId)).collection("actividad").doc(String(item.id));
        await docRef.set(item, { merge: true });
      }
    }

    // 8) vistas_perfil
    {
      const [rows] = await mysqlConn.query("SELECT * FROM vistas_perfil");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.vista_en) copy.vistaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.vista_en));
        delete copy.vista_en;
        copy.estudianteId = String(copy.estudiante_id);
        delete copy.estudiante_id;
        return copy;
      });
      await writeBatchDocs("vistas_perfil", mapped);
      for (const v of mapped) {
        const docRef = firestore.collection("estudiantes").doc(String(v.estudianteId)).collection("vistas").doc(String(v.id));
        await docRef.set(v, { merge: true });
      }
    }

    // 9) documentos (metadatos). NOTE: files not uploaded by default
    {
      const [rows] = await mysqlConn.query("SELECT * FROM documentos");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.subida_en) copy.subidaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.subida_en));
        delete copy.subida_en;
        copy.usuarioId = String(copy.usuario_id);
        delete copy.usuario_id;
        // keep ruta as-is (may be URL or local path). We'll not upload files automatically unless instructed.
        return copy;
      });
      await writeBatchDocs("documentos", mapped);
    }

    // 10) cv_estudiantes and cv_detalles -> collection 'cv' per estudiante
    {
      const [cvEst] = await mysqlConn.query("SELECT * FROM cv_estudiantes");
      for (const cv of cvEst) {
        const docId = String(cv.estudiante_id);
        const data = {
          id: cv.id,
          estudianteId: docId,
          fullName: cv.full_name || null,
          email: cv.email || null,
          phone: cv.phone || null,
          summary: cv.summary || null,
          experience: cv.experience || null,
          education: cv.education || null,
          skills: cv.skills || null,
          pdfUrl: cv.pdf_url || null,
          actualizadoEn: cv.actualizado_en ? adminSDK.firestore.Timestamp.fromDate(new Date(cv.actualizado_en)) : adminSDK.firestore.FieldValue.serverTimestamp()
        };
        await firestore.collection("cv").doc(docId).set(data, { merge: true });
      }

      const [cvDet] = await mysqlConn.query("SELECT * FROM cv_detalles");
      for (const cv of cvDet) {
        const docId = String(cv.estudiante_id);
        const data = {
          id: cv.id,
          estudianteId: docId,
          fullName: cv.fullName || null,
          email: cv.email || null,
          phone: cv.phone || null,
          summary: cv.summary || null,
          experience: cv.experience || null,
          education: cv.education || null,
          skills: cv.skills || null,
          pdfUrl: cv.pdfUrl || null,
          creadaEn: cv.creada_en ? adminSDK.firestore.Timestamp.fromDate(new Date(cv.creada_en)) : adminSDK.firestore.FieldValue.serverTimestamp()
        };
        // merge with cv doc
        await firestore.collection("cv").doc(docId).set(data, { merge: true });
      }
    }

    // 11) actividad_empresa
    {
      const [rows] = await mysqlConn.query("SELECT * FROM actividad_empresa");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.creada_en) copy.creadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.creada_en));
        delete copy.creada_en;
        copy.empresaId = String(copy.empresa_id);
        delete copy.empresa_id;
        return copy;
      });
      await writeBatchDocs("actividad_empresa", mapped);
      for (const a of mapped) {
        const docRef = firestore.collection("empresas").doc(String(a.empresaId)).collection("actividad").doc(String(a.id));
        await docRef.set(a, { merge: true });
      }
    }

    // 12) notificaciones_estudiante
    {
      const [rows] = await mysqlConn.query("SELECT * FROM notificaciones_estudiante");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.creada_en) copy.creadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.creada_en));
        delete copy.creada_en;
        copy.estudianteId = String(copy.estudiante_id);
        delete copy.estudiante_id;
        copy.leida = !!copy.leida;
        return copy;
      });
      await writeBatchDocs("notificaciones_estudiante", mapped);
      for (const n of mapped) {
        const ref = firestore.collection("estudiantes").doc(String(n.estudianteId)).collection("notificaciones").doc(String(n.id));
        await ref.set(n, { merge: true });
      }
    }

    // 13) notificaciones_universidad
    {
      const [rows] = await mysqlConn.query("SELECT * FROM notificaciones_universidad");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.creada_en) copy.creadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.creada_en));
        delete copy.creada_en;
        copy.universidadId = String(copy.universidad_id);
        delete copy.universidad_id;
        copy.leida = !!copy.leida;
        return copy;
      });
      await writeBatchDocs("notificaciones_universidad", mapped);
      for (const n of mapped) {
        const ref = firestore.collection("universidades").doc(String(n.universidadId)).collection("notificaciones").doc(String(n.id));
        await ref.set(n, { merge: true });
      }
    }

    // 14) notificaciones_empresa
    {
      const [rows] = await mysqlConn.query("SELECT * FROM notificaciones_empresa");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.creada_en) copy.creadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.creada_en));
        delete copy.creada_en;
        copy.empresaId = String(copy.empresa_id);
        delete copy.empresa_id;
        copy.leida = !!copy.leida;
        return copy;
      });
      await writeBatchDocs("notificaciones_empresa", mapped);
      for (const n of mapped) {
        const ref = firestore.collection("empresas").doc(String(n.empresaId)).collection("notificaciones").doc(String(n.id));
        await ref.set(n, { merge: true });
      }
    }

    // 15) soporte
    {
      const [rows] = await mysqlConn.query("SELECT * FROM soporte");
      const mapped = rows.map(r => {
        const copy = { ...r };
        if (copy.enviada_en) copy.enviadaEn = adminSDK.firestore.Timestamp.fromDate(new Date(copy.enviada_en));
        delete copy.enviada_en;
        copy.usuarioId = String(copy.usuario_id);
        delete copy.usuario_id;
        return copy;
      });
      await writeBatchDocs("soporte", mapped);
    }

    // 16) Añadir flags validado en estudiantes/empresas if existían as ALTERs
    // (They were added as columns in MySQL; if they exist, they are included already in select)
    console.log("Migration finished successfully.");
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  } finally {
    await mysqlConn.end();
  }
}

if (require.main === module) {
  migrate().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export default migrate;
