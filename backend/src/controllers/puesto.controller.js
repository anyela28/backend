import supabase from "../services/supabase.js";

export const listarPuestos = async (req, res) => {
    try {
      const { data, error } = await supabase
          .schema("negocio")
          .from("puesto")
          .select(`
            *,
            negocio(
              id_negocio,
              nombre_negocio
            )
          `);

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const obtenerPuestoPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("negocio")
          .from("puesto")
          .select(`
            *,
            negocio(
              id_negocio,
              nombre_negocio
            )
          `)
          .eq(
            "id_puesto",
            id
          )
          .maybeSingle();

      if (!data) {

        return res.status(404).json({
            mensaje: "Puesto no encontrado"
          });
      }

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};