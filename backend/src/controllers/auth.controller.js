import supabase from "../services/supabase.js";

export const register = async (req, res) => {
  try {

    const {
      email,
      password,
      primer_nombre
    } = req.body;

    const {
      data,
      error
    } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        primer_nombre
      }
    });

     if (error?.code === "email_exists") {
      return res.status(409).json({
        mensaje: "Ya existe una cuenta con este correo electrónico"
      });
    }

    if (error) {
      return res.status(400).json(error);
    }

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: data.user
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===== VERIFICAR SI EL CORREO EXISTE =====
    const { data: usuarios, error: errorUsuarios } =
      await supabase.auth.admin.listUsers();

    if (errorUsuarios) {
      return res.status(500).json({
        mensaje: "Error al validar el usuario"
      });
    }

    const usuario = usuarios.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!usuario) {
      return res.status(404).json({
        mensaje: "El correo electrónico no está registrado."
      });
    }

    // ===== INTENTAR INICIAR SESIÓN =====
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        mensaje: "La contraseña es incorrecta."
      });
    }

    // ===== OBTENER PERFIL =====
    const {
      data: perfil,
      error: errorPerfil
    } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
        *,
        rol(
          nombre_rol
        )
      `)
      .eq("id_perfil", data.user.id)
      .single();

    if (errorPerfil || !perfil) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado"
      });
    }

    // ===== VALIDAR ESTADO =====
    if (perfil.estado_usuario === "INACTIVO") {
      return res.status(403).json({
        mensaje: "La cuenta está desactivada",
        puede_reactivar: true
      });
    }
    
    res.cookie("token", data.session.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000
    });

    res.json({
      mensaje: "Login exitoso",
      user: data.user,
      perfil: {
        id_perfil: perfil.id_perfil,
        rol: perfil.rol
      }
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

/* Usuario autenticado*/
export const me = async (req, res) => {
  try {

    const { data: perfil, error } =
      await supabase
        .schema("cliente")
        .from("perfil")
        .select(`
          *,
          rol(
            nombre_rol
          )
        `)
        .eq(
          "id_perfil",
          req.user.id
        )
        .single();

    if (error) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado"
      });
    }

    res.json({
      user: req.user,
      perfil
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const logout = async (req, res) => {
    try {

      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json(error);
      }
      res.json({
        mensaje: "Sesión cerrada"
      });

    } catch (error) {
      res.status(500).json(error);
    }
  };

export const listarUsuarios = async (req, res) => {
  try {

    const { data, error } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
        *,
        rol(
          nombre_rol
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

export const obtenerUsuarioPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        data,
        error
      } = await supabase.auth.admin.getUserById(id);

      if (error) {
        return res.status(404).json(error);
      }
      res.json(
        data.user
      );

    } catch (error) {
      res.status(500).json(error);
    }
  };

export const recuperarPassword = async (req, res) => {
    try {
      const { email } = req.body;

      const { error } = await supabase.auth.resetPasswordForEmail(
            email
          );

      if (error) {
        return res.status(400).json(error);
      }
      res.json({
        mensaje: "Correo enviado para recuperación"
      });

    } catch (error) {
      res.status(500).json(error);
    }
  };

export const cambiarPassword = async (req, res) => {
    try {
      const {
        password
      } = req.body;

      const {
        data,
        error
      } = await supabase.auth.updateUser({
            password
          });

      if (error) {
        return res.status(400).json(error);
      }
      res.json({
        mensaje: "Contraseña actualizada",
        usuario: data.user
      });

    } catch (error) {
      res.status(500).json(error);
    }
  };

export const solicitarReactivacion = async (req, res) => {
    try {
      const { email } = req.body;
      const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
              redirectTo:
                "http://localhost:3000/reactivar-cuenta"
            }
          );

      if (
        error?.code ===
        "over_email_send_rate_limit"
      ) {
        return res.status(429).json({
            mensaje: "Ya se envió un correo recientemente. Intenta nuevamente en unos minutos."
          });
      }

      if (error) {
        return res.status(400).json(error);
      }

      res.json({
        mensaje: "Se envió un correo para reactivar la cuenta"
      });

    } catch (error) {
      res.status(500).json(error);
    }
  };

export const reactivarCuenta = async (req, res) => {
    try {
      const { email } = req.body;

      const {
        data: usuarios,
        error: errorUsuarios
      } = await supabase.auth.admin.listUsers();

      if (errorUsuarios) {
        return res.status(400).json(errorUsuarios);
      }

      const usuario =
        usuarios.users.find(
          u => u.email === email
        );

      if (!usuario) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
          });
      }

      const {
        error
      } = await supabase
          .schema("cliente")
          .from("perfil")
          .update({
            estado_usuario:
              "ACTIVO"
          })
          .eq(
            "id_perfil",
            usuario.id
          );

      if (error) {
        return res.status(400).json(error);
      }
      res.json({
        mensaje: "Cuenta reactivada correctamente"
      });

    } catch (error) {
      res.status(500).json(error);
    }
  };