import { db, auth } from "../db.js";
import bcrypt from "bcrypt";

// GET /api/usuario/me
export const getMyAccount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    const usuarioDoc = await db.collection("usuarios").doc(userId).get();

    if (!usuarioDoc.exists) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const usuario = usuarioDoc.data();
    let accountInfo = {
      id: userId,
      name: usuario.nombre,
      email: usuario.email,
      role: usuario.rol,
    };

    if (usuario.rol === "estudiante") {
      const estudianteDoc = await db.collection("estudiantes").doc(userId).get();
      if (estudianteDoc.exists) {
        const est = estudianteDoc.data();
        accountInfo = {
          ...accountInfo,
          joined: usuario.creadoEn?.toDate?.().toLocaleDateString("es-CO") || "N/A",
          validado: est.validado || false,
          estudiante_id: userId,
          isPremium: est.isPremium || false,
        };
      }
    } else if (usuario.rol === "empresa") {
      const empresaDoc = await db.collection("empresas").doc(userId).get();
      if (empresaDoc.exists) {
        const emp = empresaDoc.data();
        accountInfo = {
          ...accountInfo,
          joined: usuario.creadoEn?.toDate?.().toLocaleDateString("es-CO") || "N/A",
          nombre_empresa: emp.nombre_empresa || "",
          validado: emp.validado || false,
          empresa_id: userId,
          isPremium: emp.isPremium || false,
        };
      }
    } else if (usuario.rol === "universidad") {
      const uniDoc = await db.collection("universidades").doc(userId).get();
      if (uniDoc.exists) {
        const uni = uniDoc.data();
        accountInfo = {
          ...accountInfo,
          joined: usuario.creadoEn?.toDate?.().toLocaleDateString("es-CO") || "N/A",
          nombre_universidad: uni.nombre_universidad || "",
          universidad_id: userId,
        };
      }
    }

    res.json({ success: true, user: accountInfo });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}; // <- cierre getMyAccount

// PATCH /api/usuario/update/:id
export const updateMyAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { email, password } = req.body;

    if (id !== userId) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const updates = {};

    if (email) updates.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No hay datos para actualizar" });
    }

    await db.collection("usuarios").doc(id).update(updates);

    return res.json({ success: true, message: "Cuenta actualizada correctamente" });

  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
}; 

// PATCH /api/usuario/premium
export const activatePremium = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const collection = role === "empresa" ? "empresas" : "estudiantes";
    await db.collection(collection).doc(userId).update({ isPremium: true });
    await db.collection("usuarios").doc(userId).update({ isPremium: true });

    return res.json({ success: true, message: "Premium activated" });

  } catch (err) {
    console.error("Error activating premium:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}; 