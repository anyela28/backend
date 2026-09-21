import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import vendedorMiddleware from "../middlewares/vendedor.js";

import {
  listarMovimientos,
  obtenerMovimientoPorId,
  obtenerNegocioPorUsuario,
  crearMovimiento
}
from "../controllers/movimientoStock.controller.js";

const router = Router();

router.get("/", authMiddleware, vendedorMiddleware, listarMovimientos);
router.get("/:id", authMiddleware, vendedorMiddleware, obtenerMovimientoPorId);
router.get("/negocio-usuario", authMiddleware, vendedorMiddleware, obtenerNegocioPorUsuario);
router.post("/crear", authMiddleware, vendedorMiddleware, crearMovimiento);

export default router;