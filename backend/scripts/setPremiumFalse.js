// scripts/setPremiumFalse.js
import { db } from "../db.js";

async function setPremiumFalse() {
  const collections = ["estudiantes", "empresas"];

  for (const col of collections) {
    const snap = await db.collection(col).get();
    const batch = db.batch();

    snap.docs.forEach(doc => {
      // Solo actualiza si no tiene el campo
      if (doc.data().isPremium === undefined) {
        batch.update(doc.ref, { isPremium: false });
      }
    });

    await batch.commit();
    console.log(`✅ ${col} actualizado`);
  }

  console.log("✅ Todos los registros actualizados");
  process.exit(0);
}

setPremiumFalse();