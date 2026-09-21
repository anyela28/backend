const adminMiddleware = ( req, res, next) => {

  if (
    req.user.rol !== "ADMINISTRADOR" &&
    req.user.rol !== "SUPER_ADMIN"
  ) {
    return res.status(403).json({
      mensaje:
        "Solo administradores pueden realizar esta acción"
    });
  }

  next();
};

export default adminMiddleware;