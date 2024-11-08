const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');


dotenv.config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Or any other email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user in the database
        const user = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE uemail = ?`,
                [email],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check company's status
        const company = await new Promise((resolve, reject) => {
            db.query(`SELECT cstatus FROM company WHERE cid = ?`,
                [user[0].cid],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Compare the password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user[0].upassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (company.length === 0 || company[0].cstatus === 'inactive') {
            // Redirect to activation page if the company's status is inactive
            return res.json({ message: 'company inactive' });
        }

        // Generate a token (optional, for authentication)
        const token = jwt.sign({ id: user[0].uid }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all users settings for a company
router.get('/getusers', authenticateUser, authorizeRoles('admin'), async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const cid = companyId;

    try {
        const users = await new Promise((resolve, reject) => {
            db.query(
                'SELECT uid As user_id, uemail As email, urole AS role FROM users WHERE cid = ?',
                [cid],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
        res.status(200).json({ users });
    } catch (err) {
        console.error('Error fetching users settings:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to create or update users for a company
router.post('/updateusers', authenticateUser, authorizeRoles('admin'), async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const cid = companyId;
    const users = req.body;

    try {
        // Begin transaction
        await db.beginTransaction();

        // Insert or update new users
        const insertOrUpdateUserQuery = `
            INSERT INTO users (cid, uemail, urole, upassword)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                urole = VALUES(urole)
        `;

        // Default password to be used for all users
        const defaultPassword = '0980';
        // Hash the default password once (since it's the same for all users)
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        for (const user of users) {
            const { email, role } = user;
            await new Promise((resolve, reject) => {
                db.query(insertOrUpdateUserQuery, [cid, email, role, hashedPassword], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        // Commit transaction
        await db.commit();
        res.status(200).json({ message: 'Users updated successfully' });

    } catch (err) {
        // Rollback transaction in case of error
        await db.rollback();
        console.error('Error updating users:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to delete a specific users by its ID
router.delete('/delet-euser/:id', authenticateUser, authorizeRoles('admin'), async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const { id } = req.params;

    // console.log(id);
    try {
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM users WHERE cid = ? AND uid = ?', [companyId, id], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        res.status(200).json({ message: 'Users deleted successfully' });
    } catch (err) {
        console.error('Error deleting users:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to a specific get user
router.get('/ge-tuser', authenticateUser, async (req, res) => {
    const { userId, companyId } = req; // Extracting company ID from the authenticated user

    // console.log(userId)
    // console.log(id);
    try {
        const user = await new Promise((resolve, reject) => {
            db.query('SELECT uemail AS email FROM users WHERE cid = ? AND uid = ?', [companyId, userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        });
        res.status(200).json({ user });
    } catch (err) {
        console.error('Error get user:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to a specific get user
router.get('/ge-tuserole', authenticateUser, async (req, res) => {
    const { userId, companyId } = req; // Extracting company ID from the authenticated user

    // console.log(userId)
    // console.log(id);
    try {
        const user = await new Promise((resolve, reject) => {
            db.query('SELECT uemail AS email, urole AS role FROM users WHERE cid = ? AND uid = ?', [companyId, userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        });
        res.status(200).json({ user });
    } catch (err) {
        console.error('Error get user:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/resetp-assword', authenticateUser, async (req, res) => {
    const { userId, companyId } = req;
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    try {
        // Validate the new passwords
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Find user by email
        const user = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE uemail = ? AND cid = ? AND uid = ?', [email, companyId, userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (user.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, user[0].upassword);
        if (!isMatch) {
            // console.log(isMatch);
            return res.json({ message: 'Current Password incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await new Promise((resolve, reject) => {
            db.query('UPDATE users SET upassword = ? WHERE uemail = ?', [hashedPassword, email], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;