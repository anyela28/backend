import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import superAdminMiddleware from "../middlewares/superAdmin.js";

import {
  listarPerfiles,
  obtenerPerfilPorId,
  obtenerMiPerfil,
  completarPerfil,
  actualizarFoto,
  desactivarCuenta,
  asignarAdministrador,
  quitarAdministrador
} from "../controllers/perfil.controller.js";

const router = Router();

router.get("/me", authMiddleware, obtenerMiPerfil);
router.get("/", authMiddleware, superAdminMiddleware, listarPerfiles);
router.get("/:id", authMiddleware, superAdminMiddleware, obtenerPerfilPorId);
router.put("/completar", authMiddleware, completarPerfil);
router.put("/foto", authMiddleware, actualizarFoto);
router.put("/desactivar-cuenta", authMiddleware, desactivarCuenta);
router.put("/asignar-administrador", authMiddleware, superAdminMiddleware, asignarAdministrador);
router.put("/quitar-administrador", authMiddleware, superAdminMiddleware, quitarAdministrador);

export default router;
