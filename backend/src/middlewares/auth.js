import supabase from "../services/supabase.js";

const authMiddleware = async ( req, res, next) => {
  try {

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        mensaje: "Token requerido"
      });
    }

    const {
      data,
      error
    } = await supabase.auth.getUser(
      token
    );

    if (error) {
      return res.status(401).json(error);
    }

    req.user = data.user;

    const { data: perfil, error: perfilError } = await supabase
        .schema("cliente")
        .from("perfil")
        .select(`
          id_perfil,
          rol:id_rol (
            nombre_rol
          )
        `)
        .eq(
          "id_perfil",
          data.user.id
        )
        .single();

    if (perfilError) {
      return res.status(401).json(
        perfilError
      );
    }

    req.user.rol =
    perfil?.rol?.nombre_rol || null;

    next();

  } catch (error) {
    res.status(500).json(error);
  }
};

export default authMiddleware;