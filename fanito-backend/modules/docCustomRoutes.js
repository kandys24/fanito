const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 300 * 1024 }, // Limit file size to 300KB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    },
});

// Route to handle document customization
router.post('/doc-customization', authenticateUser, upload.single('logo'), async (req, res) => {
    const { companyId } = req;
    const cid = companyId;
    const { observations, footer, bankAccounts } = req.body;
    const toJsonBankAccount = JSON.parse(bankAccounts);
    const newLogoUrl = req.file ? `/uploads/${req.file.filename}` : null; // If a logo file is uploaded, generate the new logo URL, otherwise set it to null

    // Fetch the existing logo URL from the database
    let existingLogoUrl;
    try {
        const rows = await new Promise((resolve, reject) => {
            db.query('SELECT logoUrl FROM doccustomization WHERE cid = ?', [cid], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        existingLogoUrl = rows.length > 0 ? rows[0].logoUrl : null;
        // console.log(existingLogoUrl);
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching existing logo URL' });
    }

    // Determine the logo URL to use: either the new one or the existing one if no new logo is uploaded
    const logoUrl = newLogoUrl ? newLogoUrl : existingLogoUrl;

    const customizationQuery = `
        INSERT INTO doccustomization (cid, logoUrl, observations, footer)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            logoUrl = VALUES(logoUrl), 
            observations = VALUES(observations), 
            footer = VALUES(footer);
    `;

    const deleteBankAccountsQuery = `DELETE FROM bankAccounts WHERE cid = ?`;

    const insertBankAccountQuery = `
        INSERT INTO bankAccounts (cid, bankName, accountNumber, iban)
        VALUES (?, ?, ?, ?)
    `;

    try {
        // Begin transaction
        await db.beginTransaction();

        // Insert or update document customization
        await db.query(customizationQuery, [cid, logoUrl, observations, footer]);

        // Delete existing bank accounts
        await db.query(deleteBankAccountsQuery, [cid]);

        // Insert new bank accounts
        for (const account of toJsonBankAccount) {
            const { bankName, accountNumber, iban } = account;
            await db.query(insertBankAccountQuery, [cid, bankName, accountNumber, iban]);
        }

        // Commit the transaction
        await db.commit();
        res.status(200).json({ message: 'Customization and bank accounts updated successfully', logoUrl });

    } catch (err) {
        // Rollback the transaction in case of error
        await db.rollback();
        console.error('Error saving document customization:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/get-doc-customization', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const cid = companyId;

    const customizationQuery = 'SELECT logoUrl, observations, footer FROM doccustomization WHERE cid = ?';
    const bankAccountsQuery = 'SELECT bankName, accountNumber, iban FROM bankAccounts WHERE cid = ?';

    try {
        // Get document customization data
        const customizationResult = await new Promise((resolve, reject) => {
            db.query(customizationQuery, [cid], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        // console.log('Customization Result:', customizationResult);

        // Get bank accounts
        const bankAccountsResult = await new Promise((resolve, reject) => {
            db.query(bankAccountsQuery, [cid], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        // console.log('Bank Accounts Result:', bankAccountsResult);

        // Assuming the result is in the first index
        const customization = customizationResult || [];
        const bankAccounts = bankAccountsResult || [];

        if (!customization.length) {
            // console.log(customizationResult)
            // return res.json({ message: 'Customization not found' });
        }

        res.status(200).json({
            customization: customization[0], // Assuming one record per cid
            bankAccounts,
        });

    } catch (err) {
        console.error('Error fetching document customization:', err);
        res.status(500).json({ error: 'Database error' });
    }
});




module.exports = router;