const isAuthenticated = (req, res, next) => {
  // First check if authenticated with Passport
  if (req.isAuthenticated()) {
    // Set clinicId in the request object for easy access in route handlers
    req.clinicId = req.user._id;
    return next();
  }
  // Fallback to session check for backward compatibility
  else if (req.session && req.session.clinicId) {
    req.clinicId = req.session.clinicId;
    return next();
  }

  return res.status(401).json({ message: "Authentication required" });
};

module.exports = { isAuthenticated };
