import supabase from "../services/supabase.js";

export const misSeguimientos = async (req, res) => {
  try {

    const { data, error } = await supabase
      .schema("ventas")
      .from("seguimiento")
      .select(`
        *,
        venta!inner(
          id_venta,
          id_perfil,
          total,
          id_negocio
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

export const misPedidos = async (req, res) => {
  try {

    const {
      data: negocios,
      error: errorNegocios
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq(
        "id_perfil",
        req.user.id
      );

    if (errorNegocios) {
      return res.status(400).json(errorNegocios);
    }

    const idsNegocios =
      negocios.map(
        n => n.id_negocio
      );

    const { data, error } =
      await supabase
        .schema("ventas")
        .from("seguimiento")
        .select(`
          *,
          venta!inner(
            id_venta,
            id_negocio,
            total,
            id_perfil
          )
        `)
        .in(
          "venta.id_negocio",
          idsNegocios
        );

    if (error) {
      return res.status(400).json(error);
    }

    res.json(data);

  } catch (error) {

    res.status(500).json(error);

  }
};

export const obtenerSeguimientoPorId = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      data,
      error
    } = await supabase
      .schema("ventas")
      .from("seguimiento")
      .select(`
        *,
        venta!inner(
          id_venta,
          id_perfil,
          id_negocio
        )
      `)
      .eq(
        "id_seguimiento",
        id
      )
      .single();

    if (error || !data) {
      return res.status(404).json({
        mensaje: "Seguimiento no encontrado"
      });
    }

    res.json(data);

  } catch (error) {

    res.status(500).json(error);

  }
};

export const actualizarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params; // Aquí asumimos que 'id' es el id_venta o id_seguimiento
    const { estado_seguimiento } = req.body;

    let idVenta = id;
    let idSeguimiento = null;

    // 1. Verificar si el 'id' enviado es un id_seguimiento existente o un id_venta
    const { data: segExistente } = await supabase
      .schema("ventas")
      .from("seguimiento")
      .select("id_seguimiento, id_venta")
      .eq("id_seguimiento", id)
      .maybeSingle();

    if (segExistente) {
      idSeguimiento = segExistente.id_seguimiento;
      idVenta = segExistente.id_venta;
    }

    // 2. Obtener la venta para saber a qué negocio pertenece y validar propiedad
    const { data: venta, error: errorVenta } = await supabase
      .schema("ventas")
      .from("venta")
      .select("id_venta, id_negocio")
      .eq("id_venta", idVenta)
      .single();

    if (errorVenta || !venta) {
      return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    // 3. Validar que el negocio pertenezca al vendedor autenticado (req.user.id)
    const { data: negocio, error: errorNegocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", venta.id_negocio)
      .eq("id_perfil", req.user.id)
      .maybeSingle();

    if (errorNegocio || !negocio) {
      return res.status(403).json({ mensaje: "No puedes modificar seguimientos de otros negocios" });
    }

    // 4. Preparar los datos a actualizar / insertar
    const datosActualizar = { 
      estado_seguimiento,
      fecha_entrega: estado_seguimiento === "ENTREGADO" ? new Date() : null
    };

    let resultado;

    if (idSeguimiento) {
      // Si ya existía el seguimiento, lo actualizamos por su ID
      const { data, error } = await supabase
        .schema("ventas")
        .from("seguimiento")
        .update(datosActualizar)
        .eq("id_seguimiento", idSeguimiento)
        .select();

      if (error) return res.status(400).json(error);
      resultado = data;
    } else {
      // Si no existía seguimiento previo para esta venta, lo creamos
      const { data, error } = await supabase
        .schema("ventas")
        .from("seguimiento")
        .insert({
          id_venta: idVenta,
          ...datosActualizar
        })
        .select();

      if (error) return res.status(400).json(error);
      resultado = data;
    }

    return res.json(resultado);

  } catch (error) {
    console.error("Error crítico en actualizarSeguimiento:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};