import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import superAdminMiddleware from "../middlewares/superAdmin.js";

import {
  listarTiposDocumento,
  obtenerTipoDocumentoPorId,
  crearTipoDocumento,
  actualizarTipoDocumento,
  eliminarTipoDocumento
}
from "../controllers/tipoDocumento.controller.js";

const router = Router();

router.get("/", authMiddleware, listarTiposDocumento);
router.get("/:id", authMiddleware, obtenerTipoDocumentoPorId);
router.post("/crear", authMiddleware, superAdminMiddleware, crearTipoDocumento);
router.put("/actualizar/:id", authMiddleware, superAdminMiddleware, actualizarTipoDocumento);
router.delete("/eliminar/:id", authMiddleware, superAdminMiddleware, eliminarTipoDocumento);

export default router;