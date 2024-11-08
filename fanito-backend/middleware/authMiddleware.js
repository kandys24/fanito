// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../modules/db');

const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Retrieve the user ID and company ID from the token's payload
        const userId = decoded.id;

        // Fetch the user and their company ID from the database
        const user = await new Promise((resolve, reject) => {
            db.query(`SELECT uid, cid, urole FROM users WHERE uid = ?`, [userId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach user and company IDs to the req object
        req.userId = user.uid;
        req.userRole = user.urole;
        req.companyId = user.cid;

        next();
    } catch (err) {
        // console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateUser;