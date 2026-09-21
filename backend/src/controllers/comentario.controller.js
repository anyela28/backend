import supabase from "../services/supabase.js";

export const listarComentarios = async (req, res) => {
    try {
      const { data, error } = await supabase
          .schema("catalogo")
          .from("comentario")
          .select("*");

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const obtenerComentarioPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("catalogo")
          .from("comentario")
          .select("*")
          .eq(
            "id_comentario",
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

export const obtenerComentariosProducto = async (req, res) => {
    try {
      const { idProducto } =
        req.params;

      const { data, error } = await supabase
          .schema("catalogo")
          .from("comentario")
          .select("*")
          .eq(
            "id_producto",
            idProducto
          );

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const crearComentario = async (req, res) => {
    try {
      const {
        id_producto,
        comentario,
        calificacion
      } = req.body;

      const { data, error } = await supabase
          .schema("catalogo")
          .from("comentario")
          .insert([
            {
              id_perfil:
                req.user.id,

              id_producto,
              comentario,
              calificacion
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

export const actualizarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      comentario,
      calificacion
    } = req.body;

    const { data, error } = await supabase
        .schema("catalogo")
        .from("comentario")
        .update({
          comentario,
          calificacion
        })
        .eq(
          "id_comentario",
          id
        )
        .eq(
          "id_perfil",
          req.user.id
        )
        .select();

    if (error) {
      return res.status(400).json(error);
    }

    if (!data.length) {
      return res.status(403).json({
          mensaje: "No tienes permiso para editar este comentario"
        });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json(error);
  }
};

export const eliminarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      data,
      error
    } = await supabase
      .schema("catalogo")
      .from("comentario")
      .delete()
      .eq(
        "id_comentario",
        id
      )
      .eq(
        "id_perfil",
        req.user.id
      )
      .select();

    if (error) {
      return res.status(400).json(error);
    }

    if (!data.length) {
      return res.status(403).json({
          mensaje: "No tienes permiso para eliminar este comentario"
        });
    }

    res.json({
      mensaje: "Comentario eliminado correctamente"
    });

  } catch (error) {
    res.status(500).json(error);
  }

};

export const obtenerCalificacionPromedio = async (req, res) => {
    try {
      const { idProducto } =
        req.params;

      const { data, error } =
        await supabase
          .schema("catalogo")
          .from("comentario")
          .select("calificacion")
          .eq(
            "id_producto",
            idProducto
          );

      if (error) {
        return res.status(400).json(error);
      }

      if (
        !data ||
        data.length === 0
      ) {

        return res.json({
          id_producto:
            Number(idProducto),

          promedio: 0,

          total_comentarios: 0
        });
      }

      const suma =
        data.reduce(
          (acc, item) =>
            acc +
            item.calificacion,
          0
        );

      const promedio =
        suma /
        data.length;

      res.json({
        id_producto:
          Number(idProducto),

        promedio:
          Number(
            promedio.toFixed(2)
          ),

        total_comentarios:
          data.length
      });

    } catch (error) {
      res.status(500).json(error);
    }
};