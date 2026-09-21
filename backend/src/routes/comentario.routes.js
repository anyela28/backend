import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import clienteMiddleware from "../middlewares/cliente.js";

import {
  listarComentarios,
  obtenerComentarioPorId,
  obtenerComentariosProducto,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  obtenerCalificacionPromedio
}
from "../controllers/comentario.controller.js";

const router = Router();

router.get("/", listarComentarios);
router.get("/:id", obtenerComentarioPorId);
router.get("/producto/:idProducto", obtenerComentariosProducto);
router.post("/crear", authMiddleware, clienteMiddleware, crearComentario);
router.put("/actualizar/:id", authMiddleware, clienteMiddleware, actualizarComentario);
router.delete("/eliminar/:id", authMiddleware, clienteMiddleware, eliminarComentario);
router.get("/producto/:idProducto/promedio", obtenerCalificacionPromedio);

export default router;