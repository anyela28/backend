const clienteMiddleware = ( req, res, next) => {

  if (
    req.user.rol !== "CLIENTE"
  ) {
    return res.status(403).json({
      mensaje:
        "Solo clientes pueden realizar esta acción"
    });
  }

  next();
};

export default clienteMiddleware;