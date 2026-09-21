const vendedorMiddleware = ( req, res, next) => {

  if (
    req.user.rol !== "VENDEDOR"
  ) {
    return res.status(403).json({
      mensaje:
        "Solo vendedores pueden realizar esta acción"
    });
  }

  next();
};

export default vendedorMiddleware;