import supabase from "../services/supabase.js";

export const listarTiposDocumento = async (req, res) => {
    try {
      const { data, error } = await supabase
          .schema("cliente")
          .from("tipo_documento")
          .select("*");

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const obtenerTipoDocumentoPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("cliente")
          .from("tipo_documento")
          .select("*")
          .eq(
            "id_tipo_documento",
            id
          )
          .maybeSingle();

      if (error) {
        return res.status(400)
          .json(error);
      }

      if (!data) {
        return res.status(404)
          .json({
            mensaje: "Tipo de documento no encontrado"
          });
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const crearTipoDocumento = async (req, res) => {
    try {
      const {
        sigla,
        nombre_documento
      } = req.body;

      const { data, error } = await supabase
          .schema("cliente")
          .from("tipo_documento")
          .insert([
            {
              sigla,
              nombre_documento
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

export const actualizarTipoDocumento = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        sigla,
        nombre_documento
      } = req.body;

      const { data, error } = await supabase
          .schema("cliente")
          .from("tipo_documento")
          .update({
            sigla,
            nombre_documento
          })
          .eq(
            "id_tipo_documento",
            id
          )
          .select();

      if (error) {
        return res.status(400).json(error);
      }

      if (!data.length) {
        return res.status(404).json({
            mensaje: "Tipo de documento no encontrado"
          });
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const eliminarTipoDocumento = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("cliente")
          .from("tipo_documento")
          .delete()
          .eq(
            "id_tipo_documento",
            id
          )
          .select();

      if (error) {
        return res.status(400).json(error);
      }

      if (!data.length) {
        return res.status(404).json({
            mensaje: "Tipo de documento no encontrado"
          });
      }

      res.json({
        mensaje: "Tipo de documento eliminado"
      });

    } catch (error) {
      res.status(500).json(error);
    }
};