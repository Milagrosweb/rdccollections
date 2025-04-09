import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import permitirRoles from "../middleware/permitirRoles.js";
import Cartera from "../models/Cartera.js";

const router = express.Router();

// Middleware de seguridad
const accesoAdmin = [verifyToken, permitirRoles("admin", "super-admin")];

/* ================================
   🏦 CARTERAS (Transferencias)
=================================*/

// 📥 Obtener todas las carteras con editor
router.get("/carteras", ...accesoAdmin, async (req, res) => {
  try {
    const carteras = await Cartera.find(); // sin populate
    res.json(carteras);
  } catch {
    res.status(500).json({ error: "Error al obtener carteras" });
  }
});

// ➕ Crear nueva cartera con dirección (texto) y editor
router.post("/carteras", ...accesoAdmin, async (req, res) => {
  try {
    const { nombre, datosHtml, direccion } = req.body;

    if (!nombre || !datosHtml || !direccion) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nueva = new Cartera({
      nombre,
      datosHtml,
      direccion,
      editadoPor: req.user.username, // Usamos el username directamente
    });

    await nueva.save();
    res.json({ message: "Cartera creada", cartera: nueva });
  } catch {
    res.status(500).json({ error: "Error al crear cartera" });
  }
});

// ✏️ Editar cartera existente
router.put("/carteras/:id", ...accesoAdmin, async (req, res) => {
  try {
    const actualizada = await Cartera.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        editadoPor: req.user.username,
      },
      { new: true }
    );
    res.json({ message: "Cartera actualizada", cartera: actualizada });
  } catch {
    res.status(500).json({ error: "Error al actualizar cartera" });
  }
});

// 🗑️ Eliminar cartera
router.delete("/carteras/:id", ...accesoAdmin, async (req, res) => {
  try {
    await Cartera.findByIdAndDelete(req.params.id);
    res.json({ message: "Cartera eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar cartera" });
  }
});

export default router;
