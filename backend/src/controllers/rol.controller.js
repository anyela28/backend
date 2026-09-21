import supabase from "../services/supabase.js";

export const listarRoles = async (req, res) => {
    try {
      const { data, error } = await supabase
          .schema("cliente")
          .from("rol")
          .select("*");

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const obtenerRolPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
          .schema("cliente")
          .from("rol")
          .select("*")
          .eq("id_rol", id)
          .single();

      if (error) {
        return res.status(404).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const crearRol = async (req, res) => {
    try {
      const {
        nombre_rol
      } = req.body;

      const { data, error } = await supabase
          .schema("cliente")
          .from("rol")
          .insert([
            {
              nombre_rol
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

export const actualizarRol = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        nombre_rol
      } = req.body;

      const { data, error } = await supabase
          .schema("cliente")
          .from("rol")
          .update({
            nombre_rol
          })
          .eq("id_rol", id)
          .select();

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);

    } catch (error) {
      res.status(500).json(error);
    }
};

export const eliminarRol = async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
          .schema("cliente")
          .from("rol")
          .delete()
          .eq("id_rol", id);

      if (error) {
        return res.status(400).json(error);
      }

      res.json({
        mensaje: "Rol eliminado"
      });

    } catch (error) {
      res.status(500).json(error);
    }
};

export const cambiarRolUsuario = async (req, res) => {
  try {
    
    console.log("BODY:", req.body);

    const {
      id_perfil,
      id_rol
    } = req.body;

    // Validar datos
    if (!id_perfil || !id_rol) {
      return res.status(400).json({
        mensaje: "id_perfil e id_rol son obligatorios."
      });
    }

    // Verificar que el usuario exista
    const {
      data: perfil,
      error: errorPerfil
    } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
        id_perfil,
        id_rol
      `)
      .eq(
        "id_perfil",
        id_perfil
      )
      .single();

    if (errorPerfil || !perfil) {
      return res.status(404).json({
        mensaje: "El usuario no existe."
      });
    }

    // Verificar que el rol exista
    const {
      data: rol,
      error: errorRol
    } = await supabase
      .schema("cliente")
      .from("rol")
      .select("id_rol,nombre_rol")
      .eq(
        "id_rol",
        id_rol
      )
      .single();

    if (errorRol || !rol) {
      return res.status(404).json({
        mensaje: "El rol no existe."
      });
    }

    // Actualizar rol
    const {
      data,
      error
    } = await supabase
      .schema("cliente")
      .from("perfil")
      .update({
        id_rol
      })
      .eq(
        "id_perfil",
        id_perfil
      )
      .select(`
        id_perfil,
        id_rol
      `)
      

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Rol actualizado correctamente.",
      usuario: data,
      rol: rol.nombre_rol
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor."
    });

  }
};