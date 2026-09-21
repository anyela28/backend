import { Router } from "express";

import upload from "../middlewares/upload.js";

import { subirLogo, subirImagenProducto } from "../controllers/upload.controller.js";

const router = Router();

router.post("/logo", upload.single("logo"), subirLogo);
router.post("/producto", upload.single("imagen"), subirImagenProducto);

export default router;