import supabase from "../services/supabase.js";

export const listarDetallesVenta = async (req, res) => {
  try {

    const { data, error } = await supabase
      .schema("ventas")
      .from("detalle_venta")
      .select(`
        *,
        venta!inner(
          id_venta,
          id_perfil
        )
      `)
      .eq(
        "venta.id_perfil",
        req.user.id
      );

    if (error) {
      return res.status(400).json(error);
    }

    res.json(data);

  } catch (error) {

    res.status(500).json(error);

  }
};

export const obtenerDetallePorId = async (req, res) => {
  try {

    const { id } = req.params;

    const { data, error } = await supabase
      .schema("ventas")
      .from("detalle_venta")
      .select(`
        *,
        venta!inner(
          id_venta,
          id_perfil
        )
      `)
      .eq(
        "id_detalle",
        id
      )
      .eq(
        "venta.id_perfil",
        req.user.id
      )
      .single();

    if (error || !data) {

      return res.status(404).json({
        mensaje:
          "Detalle no encontrado"
      });

    }

    res.json(data);

  } catch (error) {

    res.status(500).json(error);

  }
};