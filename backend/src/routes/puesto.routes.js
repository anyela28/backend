import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import superAdminMiddleware from "../middlewares/superAdmin.js";

import {
  listarPuestos,
  obtenerPuestoPorId
}
from "../controllers/puesto.controller.js";

const router = Router();

router.get("/", authMiddleware, superAdminMiddleware, listarPuestos);
router.get("/:id", authMiddleware, superAdminMiddleware, obtenerPuestoPorId);

export default router;