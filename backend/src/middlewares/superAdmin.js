const superAdminMiddleware = ( req, res, next) => {

  if (
    req.user.rol !==
    "SUPER_ADMIN"
  ) {
    return res.status(403).json({
      mensaje:
        "Solo SUPER_ADMIN puede realizar esta acción"
    });
  }

  next();
};

export default superAdminMiddleware;