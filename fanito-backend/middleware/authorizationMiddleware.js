// middleware/authorizationMiddleware.js

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const role = req.userRole;

        // console.log(role)
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Forbidden: Access is denied' });
        }

        next();
    };
};

module.exports = authorizeRoles;
