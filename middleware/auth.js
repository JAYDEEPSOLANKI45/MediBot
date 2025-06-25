const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.clinicId) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
};

module.exports = { isAuthenticated };