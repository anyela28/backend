import express from "express";
const router = express.Router();

// Importación de Supabase
import supabase from "../services/supabase.js";

router.get("/puesto/:numero", async (req, res) => {
  try {
    const { numero } = req.params;

    // Consulta en supabase
    const { data: puesto, error } = await supabase
      .from("negocio")
      .select("*")
      .eq("numero_puesto", numero)
      .single();

    if (error || !puesto) {
      return res.json({
        numero_puesto: numero,
        sin_datos: true,
        mensaje: "Puesto disponible"
      });
    }

    res.json(puesto);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar el puesto" });
  }
});

export default router;