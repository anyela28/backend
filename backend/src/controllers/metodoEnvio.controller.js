import supabase from "../services/supabase.js";

export const listarMetodosEnvio = async (req, res) => {
    try {
      const { data, error } =
        await supabase
          .schema("negocio")
          .from("metodo_envio")
          .select("*");

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const obtenerMetodoEnvioPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("negocio")
          .from("metodo_envio")
          .select("*")
          .eq(
            "id_metodo_envio",
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


export const obtenerMisMetodosEnvio = async (req, res) => {

  try {

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq(
        "id_perfil",
        req.user.id
      )
      .single();

    if (!negocio) {

      return res.status(404).json({
        mensaje: "No tienes un negocio registrado."
      });

    }

    const {
      data,
      error
    } = await supabase
      .schema("negocio")
      .from("metodo_envio")
      .select("*")
      .eq(
        "id_negocio",
        negocio.id_negocio
      );

    if (error) {

      return res.status(400).json(error);

    }

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor."
    });

  }

};

export const crearMetodoEnvio = async (req, res) => {
  try {
    const {
      id_negocio,
      nombre_metodo,
      descripcion_metodo,
      costo_envio
    } = req.body;

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {
      return res.status(403).json({
        mensaje: "No puedes agregar métodos de envío a este negocio"
      });
    }

    const { data, error } = await supabase
      .schema("negocio")
      .from("metodo_envio")
      .insert([
        {
          id_negocio,
          nombre_metodo,
          descripcion_metodo,
          costo_envio
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

export const actualizarMetodoEnvio = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: metodoEnvio } = await supabase
      .schema("negocio")
      .from("metodo_envio")
      .select(`
        id_metodo_envio,
        id_negocio
      `)
      .eq("id_metodo_envio", id)
      .single();

    if (!metodoEnvio) {
      return res.status(404).json({
        mensaje: "Método de envío no encontrado"
      });
    }

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", metodoEnvio.id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {
      return res.status(403).json({
        mensaje: "No puedes modificar este método de envío"
      });
    }

    const { error } = await supabase
      .schema("negocio")
      .from("metodo_envio")
      .update(req.body)
      .eq("id_metodo_envio", id);

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Método de envío actualizado"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const eliminarMetodoEnvio = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: metodoEnvio } = await supabase
      .schema("negocio")
      .from("metodo_envio")
      .select(`
        id_metodo_envio,
        id_negocio
      `)
      .eq("id_metodo_envio", id)
      .single();

    if (!metodoEnvio) {
      return res.status(404).json({
        mensaje: "Método de envío no encontrado"
      });
    }

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", metodoEnvio.id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {
      return res.status(403).json({
        mensaje: "No puedes eliminar este método de envío"
      });
    }

    const { error } = await supabase
      .schema("negocio")
      .from("metodo_envio")
      .delete()
      .eq("id_metodo_envio", id);

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Método de envío eliminado"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const obtenerMetodosEnvioPorNegocio = async (req, res) => {
  try {
    const { id } = req.params;

    // --- AGREGA ESTO ---
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: "ID de negocio inválido" });
    }
    // ------------------

    const { data, error } = await supabase
      .schema("negocio")
      .from("metodo_envio")
      .select(`id_metodo_envio, nombre_metodo, costo_envio`)
      .eq("id_negocio", id);

    if (error) return res.status(400).json(error);
    res.json(data || []);
  } catch (error) {
    res.status(500).json(error);
  }
};