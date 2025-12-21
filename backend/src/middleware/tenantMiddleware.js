const tenantMiddleware = (req, res, next) => {
  if (req.user.role === "super_admin") {
    return next();
  }

  if (!req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: "Tenant access denied",
    });
  }

  next();
};

export default tenantMiddleware;
