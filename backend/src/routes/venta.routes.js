import { Router } from "express";

import authMiddleware from "../middlewares/auth.js";
import clienteMiddleware from "../middlewares/cliente.js";
import superAdminMiddleware from "../middlewares/superAdmin.js";
import vendedorMiddleware from "../middlewares/vendedor.js";

import {
  listarVentas,
  misCompras,
  misVentas,
  obtenerVentaPorId,
  confirmarCarrito,
  crearVenta,
  actualizarVenta,
  eliminarVenta
}
from "../controllers/venta.controller.js";

const router = Router();

router.get("/", authMiddleware, superAdminMiddleware, listarVentas);
router.post("/confirmar-carrito", authMiddleware, clienteMiddleware, confirmarCarrito);
router.get("/mis-compras", authMiddleware, misCompras);
router.get("/mis-ventas", authMiddleware, vendedorMiddleware, misVentas);
router.get("/:id", authMiddleware, clienteMiddleware, obtenerVentaPorId);
router.post("/crear", authMiddleware, clienteMiddleware, crearVenta);
router.put("/actualizar/:id", authMiddleware, clienteMiddleware, actualizarVenta);
router.delete("/eliminar/:id", authMiddleware, clienteMiddleware, eliminarVenta);

export default router;