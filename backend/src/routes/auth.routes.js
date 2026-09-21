import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import superAdminMiddleware from "../middlewares/superAdmin.js";

import {
  register,
  login,
  logout,
  me,
  listarUsuarios,
  obtenerUsuarioPorId,
  recuperarPassword,
  cambiarPassword,
  solicitarReactivacion,
  reactivarCuenta
}
  from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);
router.get("/usuarios", authMiddleware, superAdminMiddleware, listarUsuarios);
router.get("/usuarios/:id", authMiddleware, superAdminMiddleware, obtenerUsuarioPorId);
router.post("/forgot-password", recuperarPassword);
router.put("/change-password", authMiddleware, cambiarPassword);
router.post("/solicitar-reactivacion", solicitarReactivacion);
router.put("/reactivar-cuenta", reactivarCuenta);

export default router;