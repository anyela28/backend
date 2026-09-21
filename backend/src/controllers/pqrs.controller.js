import supabase from "../services/supabase.js";

export const listarPQRS = async (req, res) => {
  try {

    // ==========================
    // Obtener PQRS
    // ==========================

    const { data: pqrs, error } = await supabase
      .schema("cliente")
      .from("pqrs")
      .select("*");

    if (error) {
      console.error("ERROR PQRS:", error);
      return res.status(400).json(error);
    }

    // Obtener únicamente los id_perfil que aparecen en las PQRS
    const idsPerfil = [...new Set(pqrs.map(p => p.id_perfil))];

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
      `)
      .in("id_perfil", idsPerfil);

    if (errorPerfiles) {
      console.error("ERROR PERFILES:", errorPerfiles);
      return res.status(400).json(errorPerfiles);
    }

    // ==========================
    // Obtener correos
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
        correo: data?.user?.email ?? null
      });

    }

    // ==========================
    // Unir PQRS + Perfil + Correo
    // ==========================

    const resultado = pqrs.map((item) => {

      const perfil = perfiles.find(
        (p) => p.id_perfil === item.id_perfil
      );

      const usuario = usuarios.find(
        (u) => u.id_perfil === item.id_perfil
      );

      return {
        ...item,
        perfil: {
          ...perfil,
          correo: usuario?.correo ?? null
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

export const crearPQRS = async (req, res) => {
  try {

    const { mensaje_pqrs } = req.body;

    const { data, error } = await supabase
      .schema("cliente")
      .from("pqrs")
      .insert([
        {
          id_perfil: req.user.id,
          mensaje_pqrs
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

export const obtenerPQRSporId = async (req, res) => {
  try {

    const { id } = req.params;

    // ==========================
    // Obtener PQRS
    // ==========================

    const { data: pqrs, error } = await supabase
      .schema("cliente")
      .from("pqrs")
      .select("*")
      .eq("id_pqrs", id)
      .single();

    if (error) {
      return res.status(404).json(error);
    }

    // ==========================
    // Obtener perfil
    // ==========================

    const {
      data: perfil,
      error: errorPerfil
    } = await supabase
      .schema("cliente")
      .from("perfil")
      .select(`
        id_perfil,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido
      `)
      .eq("id_perfil", pqrs.id_perfil)
      .single();

    if (errorPerfil) {
      return res.status(400).json(errorPerfil);
    }

    // ==========================
    // Obtener correo
    // ==========================

    const {
      data: usuario,
      error: errorUsuario
    } = await supabase.auth.admin.getUserById(
      pqrs.id_perfil
    );

    if (errorUsuario) {
      console.error(errorUsuario);
    }

    res.json({
      ...pqrs,
      perfil: {
        ...perfil,
        correo: usuario?.user?.email ?? null
      }
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const listarMisPQRS = async (req, res) => {
  try {

    const { data, error } = await supabase
      .schema("cliente")
      .from("pqrs")
      .select("*")
      .eq("id_perfil", req.user.id);

    if (error) {
      return res.status(400).json(error);
    }

    res.json(data);

  } catch (error) {
    res.status(500).json(error);
  }
};

export const responderPQRS = async (req, res) => {
  try {

    const { id } = req.params;
    const { respuesta_pqrs } = req.body;

    const { data, error } = await supabase
      .schema("cliente")
      .from("pqrs")
      .update({
        respuesta_pqrs
      })
      .eq("id_pqrs", id)
      .select();

    if (error) {
      return res.status(400).json(error);
    }

    res.json(data);

  } catch (error) {
    res.status(500).json(error);
  }
};