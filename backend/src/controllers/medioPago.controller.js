import supabase from "../services/supabase.js";

export const listarMediosPago = async (req, res) => {
  try {
    const { data, error } = await supabase
        .schema("negocio")
        .from("medio_pago")
        .select("*");

    if (error) {
      return res.status(400).json(error);
    }

    res.json(data);

  } catch (error) {
    res.status(500).json(error);
  }
};

export const obtenerMisMediosPago = async (req, res) => {

    try {

        const {
            data: negocio,
            error: errorNegocio
        } = await supabase
            .schema("negocio")
            .from("negocio")
            .select("id_negocio")
            .eq(
                "id_perfil",
                req.user.id
            )
            .single();

        if (errorNegocio || !negocio) {

            return res.status(404).json({
                mensaje: "No tienes negocio."
            });

        }

        const {
            data,
            error
        } = await supabase
            .schema("negocio")
            .from("medio_pago")
            .select("*")
            .eq(
                "id_negocio",
                negocio.id_negocio
            );

        if (error) {

            return res.status(400).json(error);

        }

        res.json(data);

    }

    catch (error) {

        res.status(500).json(error);

    }

};

export const obtenerMedioPagoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
        .schema("negocio")
        .from("medio_pago")
        .select("*")
        .eq(
          "id_medio_pago",
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

export const crearMedioPago = async (req, res) => {
  try {

    const {
      id_negocio,
      nombre_medio,
      numero_medio,
      llave_medio
    } = req.body;

    // VALIDAR QUE EL NEGOCIO PERTENECE AL USUARIO
    const { data: negocio, error: errorNegocio } =
      await supabase
        .schema("negocio")
        .from("negocio")
        .select("id_negocio")
        .eq(
          "id_negocio",
          id_negocio
        )
        .eq(
          "id_perfil",
          req.user.id
        )
        .single();

    if (
      errorNegocio ||
      !negocio
    ) {

      return res.status(403).json({
        mensaje:
          "No puedes agregar medios de pago a este negocio"
      });

    }

    const { data, error } = await supabase
      .schema("negocio")
      .from("medio_pago")
      .insert([
        {
          id_negocio,
          nombre_medio,
          numero_medio,
          llave_medio
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

export const actualizarMedioPago = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: medioPago } = await supabase
      .schema("negocio")
      .from("medio_pago")
      .select(`
        id_medio_pago,
        id_negocio
      `)
      .eq("id_medio_pago", id)
      .single();

    if (!medioPago) {
      return res.status(404).json({
        mensaje: "Medio de pago no encontrado"
      });
    }

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", medioPago.id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {
      return res.status(403).json({
        mensaje: "No puedes modificar este medio de pago"
      });
    }

    const { error } = await supabase
      .schema("negocio")
      .from("medio_pago")
      .update(req.body)
      .eq("id_medio_pago", id);

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Medio de pago actualizado"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const eliminarMedioPago = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: medioPago } = await supabase
      .schema("negocio")
      .from("medio_pago")
      .select(`
        id_medio_pago,
        id_negocio
      `)
      .eq("id_medio_pago", id)
      .single();

    if (!medioPago) {
      return res.status(404).json({
        mensaje: "Medio de pago no encontrado"
      });
    }

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", medioPago.id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {
      return res.status(403).json({
        mensaje: "No puedes eliminar este medio de pago"
      });
    }

    const { error } = await supabase
      .schema("negocio")
      .from("medio_pago")
      .delete()
      .eq("id_medio_pago", id);

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Medio de pago eliminado"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const obtenerMediosPagoPorNegocio = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validación de seguridad básica
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ mensaje: "ID de negocio no proporcionado o inválido" });
    }

    // 2. Ejecución de la consulta
    // Usamos Number(id) para asegurar que comparamos un número con un número
    const { data, error } = await supabase
      .schema("negocio")
      .from("medio_pago")
      .select(`
        id_medio_pago,
        nombre_medio
      `)
      .eq("id_negocio", Number(id)); 

    // 3. Manejo de errores de la base de datos
    if (error) {
      console.error("Error de Supabase:", error);
      return res.status(400).json({ mensaje: "Error al consultar la base de datos", error });
    }

    // 4. Respuesta exitosa (si data es null, devolvemos un array vacío)
    res.json(data || []);

  } catch (error) {
    // 5. Manejo de errores inesperados del servidor
    console.error("Error interno:", error);
    res.status(500).json({ mensaje: "Error interno del servidor", error });
  }
};