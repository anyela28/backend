import supabase from "../services/supabase.js";

export const listarNegocios = async (req, res) => {
  try {

    const { estado } = req.query;

    let query = supabase
      .schema("negocio")
      .from("negocio")
      .select(`
        *,
        puesto(*)
      `);

    if (estado) {
      query = query.eq("estado_negocio", estado);
    }

    // ==========================
    // Obtener negocios
    // ==========================

    const { data: negocios, error } = await query;

    if (error) {
      console.error("ERROR NEGOCIOS:", error);
      return res.status(400).json(error);
    }

    // ==========================
    // Obtener perfiles
    // ==========================

    const {
      data: perfiles,
      error: errorPerfiles
    } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
        id_perfil,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido
      `);

    if (errorPerfiles) {
      console.error("ERROR PERFILES:", errorPerfiles);
      return res.status(400).json(errorPerfiles);
    }

    // ==========================
    // Obtener correos desde auth.users
    // ==========================

    const usuarios = [];

    for (const perfil of perfiles) {

      const { data, error } =
        await supabase.auth.admin.getUserById(
          perfil.id_perfil
        );

      if (error) {
        console.error(error);
      }

      usuarios.push({
        id_perfil: perfil.id_perfil,
        email: data?.user?.email ?? null
      });

    }

    // ==========================
    // Unir negocio + perfil
    // ==========================

    const resultado = negocios.map((negocio) => {

      const perfil = perfiles.find(
        (p) => p.id_perfil === negocio.id_perfil
      );

      const usuario = usuarios.find(
        (u) => u.id_perfil === negocio.id_perfil
      );

      return {
        ...negocio,
        perfil: {
          ...perfil,
          correo: usuario?.email ?? null
        }
      };

    });

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor"
    });

  }
};

export const obtenerNegocioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .schema("negocio")
      .from("negocio")
      .select(`
            *,
            puesto(*)
          `)
      .eq(
        "id_negocio",
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

export const obtenerMiNegocio = async (req, res) => {
  try {

    const {
      data,
      error
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .select(`
        *,
        puesto(*)
      `)
      .eq(
        "id_perfil",
        req.user.id
      )
      .single();

    if (error) {
      return res.status(404).json({
        mensaje: "No tienes un negocio registrado."
      });
    }

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor."
    });

  }
};

export const crearNegocio = async (req, res) => {
  try {
    const {
      nombre_negocio,
      descripcion_negocio,
      telefono_negocio,
      logo,
      numero_puesto
    } = req.body;

    // Verificar si el usuario ya tiene un negocio
    const {
      data: negocioExistente,
      error: errorBusqueda
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq(
        "id_perfil",
        req.user.id
      )
      .maybeSingle();

    if (errorBusqueda) {
      return res.status(400).json(errorBusqueda);
    }

    if (negocioExistente) {
      return res.status(409).json({
        mensaje: "Ya tienes un negocio registrado."
      });
    }

    const {
      data: negocio,
      error
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .insert([
        {
          id_perfil:
            req.user.id,

          nombre_negocio,
          descripcion_negocio,
          telefono_negocio,
          logo,

          estado_negocio:
            "PENDIENTE"
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json(error);
    }

    console.log("Usuario:", req.user.id);
    console.log("Negocio:", negocio);

    const {
      error: errorPuesto
    } = await supabase
      .schema("negocio")
      .from("puesto")
      .insert([
        {
          id_negocio:
            negocio.id_negocio,

          numero_puesto
        }
      ]);

    if (errorPuesto) {
      return res.status(400).json(errorPuesto);
    }

    res.status(201).json({
      mensaje: "Negocio creado correctamente",
      negocio
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const actualizarNegocio = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre_negocio,
      descripcion_negocio,
      telefono_negocio,
      logo,
      numero_puesto
    } = req.body;

    // Buscar negocio del usuario
    const {
      data: negocioActual,
      error: errorBusqueda
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("*")
      .eq(
        "id_negocio",
        id
      )
      .eq(
        "id_perfil",
        req.user.id
      )
      .single();

    if (
      errorBusqueda ||
      !negocioActual
    ) {

      return res.status(404).json({
        mensaje: "Negocio no encontrado o no tienes permisos"
      });
    }

    // Actualizar negocio
    const {
      data,
      error
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .update({
        nombre_negocio,
        descripcion_negocio,
        telefono_negocio,
        logo
      })
      .eq(
        "id_negocio",
        id
      )
      .select();

    if (error) {
      return res.status(400).json(error);
    }

    // Actualizar puesto
    if (numero_puesto) {
      if (
        negocioActual.estado_negocio === "APROBADO"
      ) {
        return res.status(403).json({
          mensaje: "No puedes modificar el número de puesto de un negocio aprobado"
        });
      }

      const {
        error: errorPuesto
      } = await supabase
        .schema("negocio")
        .from("puesto")
        .update({
          numero_puesto
        })
        .eq(
          "id_negocio",
          id
        );

      if (errorPuesto) {
        return res.status(400).json(errorPuesto);
      }
    }

    res.json({
      mensaje: "Negocio actualizado correctamente",
      negocio: data[0]
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const eliminarNegocio = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("ID negocio:", id);
    console.log("Usuario:", req.user.id);

    const { data, error } = await supabase
      .schema("negocio")
      .from("negocio")
      .delete()
      .eq(
        "id_negocio",
        id
      )
      .eq(
        "id_perfil",
        req.user.id
      )
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      return res.status(400).json(error);
    }

    if (!data.length) {
      return res.status(403).json({
        mensaje: "No tienes permiso para eliminar este negocio"
      });
    }

    res.json({
      mensaje: "Negocio eliminado"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json(error);
  }
};

export const aprobarNegocio = async (req, res) => {
  try {

    const { id_negocio } = req.body;

    const {
      data: negocio,
      error: errorBusqueda
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("*")
      .eq("id_negocio", id_negocio)
      .single();

    if (errorBusqueda || !negocio) {
      return res.status(404).json({
        mensaje: "Negocio no encontrado"
      });
    }

    const { error: errorNegocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .update({
        estado_negocio: "APROBADO"
      })
      .eq("id_negocio", id_negocio);

    if (errorNegocio) {
      return res.status(400).json(errorNegocio);
    }

    await supabase
      .schema("cliente")
      .from("notificacion")
      .insert([
        {
          id_perfil: negocio.id_perfil,
          mensaje:
            "¡Felicitaciones! Tu negocio fue aprobado. Ya puedes comunicarte con el administrador para activar tu rol de vendedor.",
          tipo: "INFORMATIVA"
        }
      ]);

    res.json({
      mensaje: "Negocio aprobado correctamente."
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor."
    });

  }
};

export const rechazarNegocio = async (req, res) => {
  try {
    const {
      id_negocio,
      observacion_admin
    } = req.body;

    const {
      data: negocio,
      error: errorBusqueda
    } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("*")
      .eq("id_negocio", id_negocio)
      .single();

    if (errorBusqueda || !negocio) {
      return res.status(404).json({
        mensaje: "Negocio no encontrado"
      });
    }

    const { error } = await supabase
      .schema("negocio")
      .from("negocio")
      .update({
        estado_negocio:
          "RECHAZADO",
        observacion_admin
      })
      .eq(
        "id_negocio",
        id_negocio
      );

    if (error) {
      return res.status(400).json(error);
    }

    const { error: errorNotificacion } = await supabase
      .schema("cliente")
      .from("notificacion")
      .insert([
        {
          id_perfil: negocio.id_perfil,
          mensaje:
            `Tu solicitud de negocio fue rechazada.\n\nObservación del administrador:\n${observacion_admin}`,
          tipo: "ALERTA"
        }
      ]);

    if (errorNotificacion) {
      console.error(errorNotificacion);
    }

    res.json({
      mensaje: "Negocio rechazado"
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const obtenerNegociosPublicos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .schema("negocio")
      .from("negocio")
      .select(`
        id_negocio,
        nombre_negocio,
        descripcion_negocio,
        logo
      `)
      .eq("estado_negocio", "APROBADO"); // 👈 CORRECTO

    if (error) {
      return res.status(400).json({
        mensaje: "Error al obtener negocios",
        error
      });
    }

    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};