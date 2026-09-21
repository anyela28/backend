import supabase from "../services/supabase.js";

// backend: listarMovimientos (CORREGIDO)
export const listarMovimientos = async (req, res) => {
  try {
    const { id_negocio } = req.query;

    if (!id_negocio) {
      return res.status(400).json({ mensaje: "Falta el id_negocio" });
    }

    const { data, error } = await supabase
      .schema("catalogo")
      .from("movimiento_stock")
      .select(`
        *,
        producto:fk_producto_movimiento (
          id_producto,
          nombre_producto,
          stock,
          estado_producto,
          id_negocio
        )
      `)
      .eq("producto.id_negocio", id_negocio)
      .order("fecha_movimiento", { ascending: false });

    if (error) {
      console.error("Error DETALLADO de Supabase:", error);
      return res.status(400).json(error);
    }

    res.json(data);

  } catch (error) {
    console.error("Error servidor:", error);
    res.status(500).json(error);
  }
};

export const obtenerMovimientoPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("catalogo")
          .from("movimiento_stock")
          .select("*")
          .eq(
            "id_movimiento",
            id
          )
          .single();

      if (error) {
        return res.status(404).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const obtenerNegocioPorUsuario = async (req, res) => {
  try {
    const { id_perfil } = req.query;
    
    // Consultamos la tabla de relación en el esquema 'negocio'
    const { data, error } = await supabase
      .schema("negocio")
      .from("negocio") // Cambia esto por el nombre de tu tabla de relación
      .select("id_negocio")
      .eq("id_perfil", id_perfil)
      .single();

    if (error) return res.status(404).json({ mensaje: "Negocio no encontrado" });
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const crearMovimiento = async (req, res) => {
  try {
    const { id_producto, tipo_movimiento, cantidad_productos, motivo } = req.body;

    // 1. Buscar el producto actual
    const { data: producto, error: errorProducto } = await supabase
      .schema("catalogo")
      .from("producto")
      .select("*")
      .eq("id_producto", id_producto)
      .single();

    if (errorProducto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    let nuevoStock = producto.stock;

    // ==========================================
    // LÓGICA DE STOCK ACTUALIZADA
    // ==========================================
    
    if (tipo_movimiento === "ENTRADA") {
      // Reemplaza el stock viejo con el nuevo valor enviado
      nuevoStock = cantidad_productos; 
    }

    if (tipo_movimiento === "SALIDA") {
      if (producto.stock < cantidad_productos) {
        return res.status(400).json({ mensaje: "Stock insuficiente" });
      }
      // La salida sigue restando del stock actual
      nuevoStock -= cantidad_productos;
    }

    if (tipo_movimiento === "AJUSTE") {
      // Dependiendo de cómo uses el ajuste, aquí lo dejamos sumando. 
      // (Si envías números negativos, restará).
      nuevoStock += cantidad_productos;
    }

    // ==========================================

    // 2. Actualizar el producto con el nuevo stock
    await supabase
      .schema("catalogo")
      .from("producto")
      .update({
        stock: nuevoStock,
        estado_producto: nuevoStock === 0 ? "AGOTADO" : "DISPONIBLE"
      })
      .eq("id_producto", id_producto);

    // 3. Registrar el movimiento en el historial
    const { data, error } = await supabase
      .schema("catalogo")
      .from("movimiento_stock")
      .insert([
        {
          id_producto,
          tipo_movimiento,
          cantidad_productos, // Aquí quedará registrado el valor al que se actualizó
          motivo
        }
      ])
      .select();

    if (error) {
      return res.status(400).json(error);
    }
    
    res.status(201).json(data);

  } catch (error) {
    res.status(500).json(error);
  }
};