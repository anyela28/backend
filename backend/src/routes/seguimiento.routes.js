import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import vendedorMiddleware from "../middlewares/vendedor.js";

import {
  misSeguimientos,
  misPedidos,
  obtenerSeguimientoPorId,
  actualizarSeguimiento
}
from "../controllers/seguimiento.controller.js";

const router = Router();

router.get("/mis-seguimientos", authMiddleware, misSeguimientos);
router.get("/mis-pedidos", authMiddleware, vendedorMiddleware, misPedidos);
router.get("/:id", authMiddleware, vendedorMiddleware, obtenerSeguimientoPorId);
router.put("/actualizar/:id", authMiddleware, vendedorMiddleware, actualizarSeguimiento);

export default router;