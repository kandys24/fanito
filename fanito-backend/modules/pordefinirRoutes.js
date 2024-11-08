const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

// Route to a specific get mytaxes
router.get('/ge-ttax', authenticateUser, async (req, res) => {
    const { userId, companyId } = req; // Extracting company ID from the authenticated user

    // console.log(userId)
    try {
        const mytax = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM mytaxes WHERE cid = ?', [companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        });
        res.status(200).json({ mytax });
    } catch (err) {
        console.error('Error get mytaxes:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;