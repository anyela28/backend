import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import rolRoutes from "./routes/rol.routes.js";
import tipoDocumentoRoutes from "./routes/tipoDocumento.routes.js";
import perfilRoutes from "./routes/perfil.routes.js";
import notificacionRoutes from "./routes/notificacion.routes.js";
import pqrsRoutes from "./routes/pqrs.routes.js";
import negocioRoutes from "./routes/negocio.routes.js";
import puestoRoutes from "./routes/puesto.routes.js";
import medioPagoRoutes from "./routes/medioPago.routes.js";
import metodoEnvioRoutes from "./routes/metodoEnvio.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import movimientoStockRoutes from "./routes/movimientoStock.routes.js";
import comentarioRoutes from "./routes/comentario.routes.js";
import ventaRoutes from "./routes/venta.routes.js";
import detalleVentaRoutes from "./routes/detalleVenta.routes.js";
import seguimientoRoutes from "./routes/seguimiento.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import buscadorRoutes from "./routes/buscador.routes.js";
import mapaRoutes from "./routes/mapa.routes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/tipo-documento", tipoDocumentoRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/notificacion", notificacionRoutes);
app.use("/api/pqrs", pqrsRoutes);
app.use("/api/negocio", negocioRoutes);
app.use("/api/puestos", puestoRoutes);
app.use("/api/medios-pago", medioPagoRoutes);
app.use("/api/metodos-envio", metodoEnvioRoutes);
app.use("/api/categoria", categoriaRoutes);
app.use("/api/producto", productoRoutes);
app.use("/api/movimientos-stock", movimientoStockRoutes);
app.use("/api/comentarios", comentarioRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/detalles-venta", detalleVentaRoutes);
app.use("/api/seguimientos", seguimientoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", buscadorRoutes);
app.use("/api/mapa", mapaRoutes);

export default app;