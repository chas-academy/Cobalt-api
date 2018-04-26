const requireLogin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Needs authentication."
    });
  }

  return next();
};

export { requireLogin };
