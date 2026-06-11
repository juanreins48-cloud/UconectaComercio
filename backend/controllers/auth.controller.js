// controllers/auth.controller.js
import { db, auth } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export async function register(req, res) {
  try {
    console.log("REQ BODY:", req.body);

    const { role, name, email, password } = req.body;

    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const rolesMap = {
      "Student": "estudiante",
      "Company": "empresa",
      "University": "universidad",
    };

    const rol = rolesMap[role];
    if (!rol) return res.status(400).json({ message: "Invalid role" });

    // Verificar si el email ya existe
    const existing = await db.collection("usuarios")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario en Firestore
    const userRef = await db.collection("usuarios").add({
      nombre: name,
      email,
      password: hashed,
      rol,
      creadoEn: new Date(),
    });

    const userId = userRef.id;

    // Crear documento por rol
    if (rol === "estudiante") {
      await db.collection("estudiantes").doc(userId).set({
        usuario_id: userId,
        creadoEn: new Date(),
      });
    }

    if (rol === "empresa") {
      await db.collection("empresas").doc(userId).set({
        usuario_id: userId,
        nombre_empresa: "",
        creadoEn: new Date(),
      });
    }

    if (rol === "universidad") {
      await db.collection("universidades").doc(userId).set({
        usuario_id: userId,
        creadoEn: new Date(),
      });
    }

    return res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    // Buscar usuario por email
    const snapshot = await db.collection("usuarios")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // Validar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Crear token
    const token = jwt.sign(
      { id: user.id, role: user.rol },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // Obtener ID del perfil según rol
    let studentId = null;
    let empresaId = null;

    if (user.rol === "estudiante") {
      const estudianteDoc = await db.collection("estudiantes").doc(user.id).get();
      if (estudianteDoc.exists) studentId = estudianteDoc.id;
    }

    if (user.rol === "empresa") {
      const empresaDoc = await db.collection("empresas").doc(user.id).get();
      if (empresaDoc.exists) empresaId = empresaDoc.id;
    }

    return res.json({
      success: true,
      message: "Login successful",
      token,
      userId: user.id,
      role: user.rol,
      studentId,
      empresaId,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}