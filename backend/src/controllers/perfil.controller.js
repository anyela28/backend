import supabase from "../services/supabase.js";

export const listarPerfiles = async (req, res) => {
  try {

    const { data: perfiles, error } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
        *,
        rol:id_rol(
        id_rol,
        nombre_rol
        ),
        tipo_documento:id_tipo_documento(
          sigla,
          nombre_documento
        )
      `);

    if (error) {
      return res.status(400).json(error);
    }

    // Obtener usuarios de Auth
    const {
      data: authData,
      error: authError
    } = await supabase.auth.admin.listUsers();

    if (authError) {
      return res.status(400).json(authError);
    }

    const perfilesConCorreo = perfiles.map((perfil) => {

      const usuarioAuth = authData.users.find(
        (u) => u.id === perfil.id_perfil
      );

      return {
        ...perfil,
        email: usuarioAuth?.email || null
      };

    });

    res.json(perfilesConCorreo);

  } catch (error) {
    res.status(500).json(error);
  }
};

export const obtenerPerfilPorId = async (req, res) => {
  try {

    const { id } = req.params;

    const { data, error } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
        *,
        rol:id_rol(
          nombre_rol
        ),
        tipo_documento:id_tipo_documento(
          sigla,
          nombre_documento
        )
      `)
      .eq("id_perfil", id)
      .maybeSingle();

    if (error) {
      return res.status(400).json(error);
    }

    if (!data) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado"
      });
    }

    // Obtener usuario de Auth
    const {
      data: authUser,
      error: authError
    } = await supabase.auth.admin.getUserById(id);

    if (authError) {
      return res.status(400).json(authError);
    }

    res.json({
      ...data,
      email: authUser.user.email
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const obtenerMiPerfil = async (req, res) => {
  try {
    
    const { data, error } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
          *,
          rol:id_rol(
          id_rol,
          nombre_rol
          )
        `)
      .eq(
        "id_perfil",
        req.user.id
      )
      .single();

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      ...data,
      email: req.user.email
    });

  } catch (error) {
    res.status(500).json(error);
  }
};


export const completarPerfil = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      id_tipo_documento,
      numero_documento
    } = req.body;

    const datosActualizar = {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
    };

    // Solo actualizar si viene valor
    if (id_tipo_documento !== "") {
      datosActualizar.id_tipo_documento =
        id_tipo_documento || null;
    }

    if (numero_documento !== "") {
      datosActualizar.numero_documento =
        numero_documento || null;
    }

    const { data, error } = await supabase
      .schema("cliente")
      .from("perfil")
      .update(datosActualizar)
      .eq("id_perfil", req.user.id)
      .select()
      .single();

    if (error) {
      console.error("ERROR SUPABASE:", error);

      return res.status(400).json({
        mensaje: error.message,
      });
    }

    res.json({
      mensaje: "Perfil actualizado correctamente",
      data,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

export const actualizarFoto = async (req, res) => {
  try {
    const {
      url_foto
    } = req.body;

    const {
      error
    } = await supabase
      .schema("cliente")
      .from("perfil")
      .update({
        foto_perfil: url_foto
      })
      .eq(
        "id_perfil",
        req.user.id
      );

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Foto actualizada"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const desactivarCuenta = async (req, res) => {
  try {
    const idUsuario =
      req.user.id;

    const {
      data,
      error
    } = await supabase
      .schema("cliente")
      .from("perfil")
      .update({
        estado_usuario:
          "INACTIVO"
      })
      .eq(
        "id_perfil",
        idUsuario
      )
      .select();

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Cuenta desactivada correctamente",
      data
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const asignarAdministrador = async (req, res) => {
  try {
    const { id_usuario } =
      req.body;

    const { data: rolAdmin } = await supabase
      .schema("cliente")
      .from("rol")
      .select("id_rol")
      .eq(
        "nombre_rol",
        "ADMINISTRADOR"
      )
      .single();

    if (!rolAdmin) {

      return res.status(404).json({
        mensaje: "Rol ADMINISTRADOR no encontrado"
      });
    }

    const { error } = await supabase
      .schema("cliente")
      .from("perfil")
      .update({
        id_rol:
          rolAdmin.id_rol
      })
      .eq(
        "id_perfil",
        id_usuario
      );

    if (error) {
      return res.status(400)
        .json(error);
    }

    res.json({
      mensaje: "Administrador asignado correctamente"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const quitarAdministrador = async (req, res) => {
  try {
    const {
      id_usuario
    } = req.body;

    const { data: rolCliente } = await supabase
      .schema("cliente")
      .from("rol")
      .select("id_rol")
      .eq(
        "nombre_rol",
        "CLIENTE"
      )
      .single();

    if (!rolCliente) {

      return res.status(404).json({
        mensaje: "Rol CLIENTE no encontrado"
      });
    }

    const { error } = await supabase
      .schema("cliente")
      .from("perfil")
      .update({
        id_rol:
          rolCliente.id_rol
      })
      .eq(
        "id_perfil",
        id_usuario
      );

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      mensaje: "Administrador removido correctamente"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};