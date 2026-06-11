import mysql from "mysql2/promise";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// 1. Conexión MySQL ---------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// 2. Conexión Firebase ------------------
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();


// 3. Función que migra una tabla ------------------
async function migrateTable(mysqlTable, firestoreCollection) {
  console.log(`Migrando tabla: ${mysqlTable} → colección: ${firestoreCollection}`);

  const [rows] = await pool.query(`SELECT * FROM ${mysqlTable}`);

  for (const row of rows) {
    await db.collection(firestoreCollection).doc(String(row.id)).set(row);
  }

  console.log(`✔ ${mysqlTable} migrada. Total: ${rows.length}`);
}


// 4. Migrar todas las tablas ------------------
async function startMigration() {
  try {
    await migrateTable("usuarios", "usuarios");
    await migrateTable("estudiantes", "estudiantes");
    await migrateTable("empresas", "empresas");
    await migrateTable("universidades", "universidades");
    await migrateTable("ofertas", "ofertas");
    await migrateTable("aplicaciones", "aplicaciones");
    await migrateTable("actividad_estudiante", "actividad_estudiante");
    await migrateTable("vistas_perfil", "vistas_perfil");
    await migrateTable("documentos", "documentos");
    await migrateTable("cv_estudiantes", "cv_estudiantes");
    await migrateTable("cv_detalles", "cv_detalles");
    await migrateTable("actividad_empresa", "actividad_empresa");
    await migrateTable("notificaciones_estudiante", "notificaciones_estudiante");
    await migrateTable("notificaciones_universidad", "notificaciones_universidad");
    await migrateTable("notificaciones_empresa", "notificaciones_empresa");
    await migrateTable("soporte", "soporte");

    console.log("\n🎉 MIGRACIÓN COMPLETA 🎉");
    process.exit();
  } catch (err) {
    console.error("❌ Error al migrar:", err);
    process.exit(1);
  }
}

startMigration();
