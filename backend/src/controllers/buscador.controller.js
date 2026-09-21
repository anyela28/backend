import supabase from "../services/supabase.js";

export const buscarProductosYNegocios = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "El parámetro de búsqueda 'q' es obligatorio." });
  }

  const searchTerm = q.trim();

  try {
    // 1. Buscar en productos usando el esquema 'catalogo'
    const { data: productos, error: errorProductos } = await supabase
      .schema("catalogo")
      .from("producto")
      .select("*, categoria:id_categoria(nombre_categoria)")
      .eq("estado_producto", "DISPONIBLE")
      .or(`nombre_producto.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`);

    if (errorProductos) throw errorProductos;

    // 2. Buscar en negocios usando el esquema 'negocio'
    const { data: negocios, error: errorNegocios } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("*")
      .eq("estado_negocio", "APROBADO")
      .or(`nombre_negocio.ilike.%${searchTerm}%,descripcion_negocio.ilike.%${searchTerm}%`);

    if (errorNegocios) throw errorNegocios;

    return res.json({
      productos: productos || [],
      negocios: negocios || [],
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    return res.status(500).json({ message: "Error interno del servidor al buscar." });
  }
};