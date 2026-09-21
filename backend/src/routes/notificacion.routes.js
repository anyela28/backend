import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";

import {
  listarNotificaciones,
  obtenerNotificacionPorId,
  crearNotificacion,
  marcarComoLeida,
  eliminarNotificacion
}
from "../controllers/notificacion.controller.js";

const router = Router();

router.get("/", authMiddleware, listarNotificaciones);
router.get("/:id", authMiddleware, obtenerNotificacionPorId);
router.post("/crear", authMiddleware, crearNotificacion);
router.put("/:id/leida", authMiddleware, marcarComoLeida);
router.delete("/eliminar/:id", authMiddleware, eliminarNotificacion);

export default router;