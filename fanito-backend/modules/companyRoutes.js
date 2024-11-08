const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const crypto = require('crypto');
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

// Function to generate a unique token
const generateUniqueToken = (email, phone) => {
    const data = `${email}:${phone}:${Date.now()}`; // Combine email, phone, and current timestamp
    return crypto.createHash('sha256').update(data).digest('hex'); // Hash the combination
};

const checkTokenUniqueness = async (token) => {
    return new Promise((resolve, reject) => {
        db.query(`
            SELECT COUNT(*) AS count FROM company WHERE activation_token = ?`,
            [token],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count === 0);
            }
        );
    });
};

router.post('/setcompany', async (req, res) => {
    const { companyName, email, phone, password } = req.body;
    const cname = companyName, cemail = email, cphone = phone, upassword = password, uemail = email;

    if (!cname || !cemail || !cphone || !uemail || !upassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        
        // Check if the email already exists in the company table
        const companyEmailExists = await new Promise((resolve, reject) => {
            db.query(`SELECT COUNT(*) AS count FROM company WHERE cemail = ?`, [cemail], (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count > 0);
            });
        });

        // Check if the email already exists in the users table
        const userEmailExists = await new Promise((resolve, reject) => {
            db.query(`SELECT COUNT(*) AS count FROM users WHERE uemail = ?`, [uemail], (err, results) => {
                if (err) return reject(err);
                resolve(results[0].count > 0);
            });
        });

        if (companyEmailExists || userEmailExists) {
            // console.log(companyEmailExists)
            return res.json({ error: 'Email already in use' });
        }

        // Start a transaction
        await db.beginTransaction();

        let activationToken;
        let tokenIsUnique = false;

        // Generate a unique activation token
        while (!tokenIsUnique) {
            activationToken = generateUniqueToken(cemail, cphone);
            tokenIsUnique = await checkTokenUniqueness(activationToken);
        }

        // Insert new company with the activation token
        const companyResult = await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO company (cname, cemail, cphone, activation_token)
                VALUES (?, ?, ?, ?)`,
                [cname, cemail, cphone, activationToken],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const cid = companyResult.insertId;

        // Hash the password
        const hashedPassword = await bcrypt.hash(upassword, 10);

        // Insert new admin user
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO users (cid, uemail, upassword, urole)
                VALUES (?, ?, ?, 'admin')`,
                [cid, uemail, hashedPassword],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Insert details into the companyDetails table
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO companyDetails (cid, companyName, taxpayerNumber, address, vatScheme, email, website, phone, fax, city, imgUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cid, cname, '', '', '', cemail, '', cphone, '', '', ''],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Commit transaction
        await db.commit();

        // Email options with activation link
        const mailOptions = {
            from: 'softwise.investments@gmail.com', // Sender address
            to: cemail,  // List of recipients
            subject: 'Activate your account', // Subject line
            html: `<p>Click the <a href="http://localhost:3001/company/activate?token=${activationToken}" style="color:#87ceeb; font-weight:600">link</a> to activate your account!</p>`,
        };

        // Optionally send an email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error:', error);
            }
            console.log('Email sent:', info.response);
        });

        res.status(201).json({ message: 'Company and admin user created successfully' });

    } catch (err) {
        // Rollback transaction in case of error
        await db.rollback();
        console.error('Error creating company and admin user:', err);
        res.status(500).json({ error: 'An error occurred while creating the company and admin user' });
    }
});


router.get('/activate', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Invalid activation token' });
    }

    try {
        // Find the company with the matching activation token
        const companyResult = await new Promise((resolve, reject) => {
            db.query(`
                SELECT cid FROM company WHERE activation_token = ?`,
                [token],
                (err, results) => {
                    if (err) return reject(err);
                    if (results.length === 0) return resolve(null);
                    resolve(results[0]);
                }
            );
        });

        if (!companyResult) {
            return res.status(400).json({ error: 'Invalid or expired activation token' });
        }

        const cid = companyResult.cid;

        // Update the company's status to active and clear the activation token
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE company SET cstatus = 'active', activation_token = NULL WHERE cid = ?`,
                [cid],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // res.status(200).send('<h1>Account activated successfully!</h1>');

        // Redirect to a React route
        res.redirect('http://localhost:5173/activar');

    } catch (err) {
        console.error('Error activating company:', err);
        res.status(500).json({ error: 'An error occurred during account activation' });
    }
});

router.get('/getcompany', authenticateUser, async (req, res) => {
    try {
        const { companyId } = req;
        // console.log(companyId)

        // Fetch the company details using the attached companyId
        const companyDetails = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM companyDetails WHERE cid = ?`, [companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        res.json({ companyDetails });
    } catch (err) {
        console.error('Error fetching company details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/updatecompany', authenticateUser, authorizeRoles('admin', 'collab'), async (req, res) => {
    const { companyId } = req;  // This should be attached by the authenticateUser middleware
    const {
        empresa,
        contribuinte,
        endereco,
        regimeIva,
        email,
        website,
        telefone,
        fax,
        cidade,
    } = req.body;
        

    // Validate the required fields
    if (!empresa || !contribuinte || !endereco || !regimeIva || !email || !telefone || !cidade) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Update the company details in the database
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE companyDetails
                SET companyName = ?, taxpayerNumber = ?, address = ?, vatScheme = ?, email = ?, website = ?, phone = ?, fax = ?, city = ?
                WHERE cid = ?`,
                [empresa, contribuinte, endereco, regimeIva, email, website, telefone, fax, cidade, companyId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        res.status(200).json({ message: 'Company details updated successfully' });
    } catch (err) {
        console.error('Error updating company details:', err);
        res.status(500).json({ error: 'An error occurred while updating the company details' });
    }
});


/* -------------------------------------------- ------------------------------------------------------*/
//examples
router.get('/admin-only', authenticateUser, authorizeRoles('admin'), async (req, res) => {
    // This route can only be accessed by admin users
    res.json({ message: 'Welcome, Admin!' });
});

router.get('/collab-or-admin', authenticateUser, authorizeRoles('collab', 'admin'), async (req, res) => {
    // This route can be accessed by both collab and admin users
    res.json({ message: 'Welcome, Collab or Admin!' });
});

router.get('/seller-only', authenticateUser, authorizeRoles('seller'), async (req, res) => {
    // This route can only be accessed by seller users
    res.json({ message: 'Welcome, Seller!' });
});

router.get('/company-details', authenticateUser, authorizeRoles('admin', 'collab'), async (req, res) => {
    const { companyId } = req;

    try {
        const companyDetails = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM companyDetails WHERE cid = ?`, [companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        res.json({ companyDetails });
    } catch (err) {
        console.error('Error fetching company details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;