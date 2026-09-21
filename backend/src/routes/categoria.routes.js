import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import adminMiddleware from "../middlewares/admin.js";

import {
  listarCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
}
from "../controllers/categoria.controller.js";

const router = Router();

router.get("/", listarCategorias);
router.get("/:id", obtenerCategoriaPorId);
router.post("/crear", authMiddleware, adminMiddleware, crearCategoria);
router.put( "/actualizar/:id", authMiddleware, adminMiddleware, actualizarCategoria);
router.delete("/eliminar/:id", authMiddleware, adminMiddleware, eliminarCategoria);

export default router;