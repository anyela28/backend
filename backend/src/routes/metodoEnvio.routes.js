import { Router } from "express";

import authMiddleware
from "../middlewares/auth.js";

import vendedorMiddleware
from "../middlewares/vendedor.js";

import {
  listarMetodosEnvio,
  obtenerMetodoEnvioPorId,
  obtenerMisMetodosEnvio,
  crearMetodoEnvio,
  actualizarMetodoEnvio,
  eliminarMetodoEnvio,
  obtenerMetodosEnvioPorNegocio
}
from "../controllers/metodoEnvio.controller.js";

const router = Router();

router.get("/", listarMetodosEnvio);
router.get("/mis-metodos", authMiddleware, vendedorMiddleware, obtenerMisMetodosEnvio);
router.get("/negocio/:id", obtenerMetodosEnvioPorNegocio);
router.get("/:id", obtenerMetodoEnvioPorId);
router.post("/crear", authMiddleware, vendedorMiddleware, crearMetodoEnvio);
router.put("/actualizar/:id", authMiddleware, vendedorMiddleware, actualizarMetodoEnvio);
router.delete("/eliminar/:id", authMiddleware, vendedorMiddleware, eliminarMetodoEnvio);

export default router;