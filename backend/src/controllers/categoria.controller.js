import supabase from "../services/supabase.js";

export const listarCategorias = async (req, res) => {
    try {
      const { data, error } = await supabase
          .schema("catalogo")
          .from("categoria")
          .select(`
            *,
            subcategorias:categoria!id_categoria_padre(*)
          `);

      if (error) {
        return res.status(400).json(error);
      }
      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const obtenerCategoriaPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("catalogo")
          .from("categoria")
          .select("*")
          .eq(
            "id_categoria",
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

export const crearCategoria = async (req, res) => {
    try {
      const {
        nombre_categoria,
        id_categoria_padre
      } = req.body;

      const { data, error } = await supabase
          .schema("catalogo")
          .from("categoria")
          .insert([
            {
              nombre_categoria,
              id_categoria_padre
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

export const actualizarCategoria = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        nombre_categoria,
        id_categoria_padre
      } = req.body;

      const { error } = await supabase
          .schema("catalogo")
          .from("categoria")
          .update({
            nombre_categoria,
            id_categoria_padre
          })
          .eq(
            "id_categoria",
            id
          );

      if (error) {
        return res.status(400).json(error);
      }

      res.json({
        mensaje: "Categoría actualizada"
      });

    } catch (error) {
      res.status(500).json(error);
    }
};

export const eliminarCategoria = async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
          .schema("catalogo")
          .from("categoria")
          .delete()
          .eq(
            "id_categoria",
            id
          );

      if (error) {
        return res.status(400).json(error);
      }

      res.json({
        mensaje: "Categoría eliminada"
      });

    } catch (error) {
      res.status(500).json(error);
    }
};