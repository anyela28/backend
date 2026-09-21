import { Router } from "express";
import { buscarProductosYNegocios } from "../controllers/buscador.controller.js"; 

const router = Router();

// Endpoint que responderá a /api/buscar?q=termino
router.get("/buscar", buscarProductosYNegocios);

export default router;