module.exports = (role) => async (req, res, next) => {
  if (req.user.role === role) return next();
  res.status(401).send({ error: "Unauthorized" });
};
