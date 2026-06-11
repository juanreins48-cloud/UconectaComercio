// controllers/files.controller.js
import { db } from '../db.js';

// Cambio: INSERT INTO files → db.collection('files').add()
export async function uploadFile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    const { originalname, filename, mimetype, size, path } = req.file;
    const uploaded_by = req.user?.id || null;

    // Cambio: result.insertId no existe en Firestore — usamos ref.id (string)
    const ref = await db.collection('files').add({
      original_name: originalname,
      filename,
      mime_type: mimetype,
      size,
      path,
      uploaded_by,
      uploaded_at: new Date(), // Cambio: MySQL tenía TIMESTAMP DEFAULT NOW(), Firestore no
    });

    res.status(201).json({ id: ref.id, originalname, filename });
  } catch (err) {
    next(err);
  }
}

// Cambio: SELECT ORDER BY uploaded_at DESC → .orderBy('uploaded_at', 'desc')
export async function listFiles(req, res, next) {
  try {
    const snapshot = await db.collection('files')
      .orderBy('uploaded_at', 'desc')
      .get();

    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(files);
  } catch (err) {
    next(err);
  }
}

// Cambio: SELECT WHERE id → db.collection('files').doc(id).get()
export async function serveFile(req, res, next) {
  try {
    const doc = await db.collection('files').doc(req.params.id).get();

    if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });

    const file = doc.data();
    res.sendFile(file.path, { root: '.' });
  } catch (err) {
    next(err);
  }
}