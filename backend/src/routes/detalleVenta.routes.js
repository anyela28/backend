import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";

import {
  listarDetallesVenta,
  obtenerDetallePorId
}
from "../controllers/detalleVenta.controller.js";

const router = Router();

router.get("/", authMiddleware, listarDetallesVenta);
router.get("/:id", authMiddleware, obtenerDetallePorId);

export default router;