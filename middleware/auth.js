const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Access Denied" });

    try {
        const decoded = jwt.verify(token, 'secretKey123');
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ msg: "Invalid Token" });
    }
};

const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Forbidden Access" });
    }
    next();
};

module.exports = { authenticate, authorize };
