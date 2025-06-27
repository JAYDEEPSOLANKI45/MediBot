const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.clinicId) {
        // Set clinicId in the request object for easy access in route handlers
        req.clinicId = req.session.clinicId;
        return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
};

module.exports = { isAuthenticated };