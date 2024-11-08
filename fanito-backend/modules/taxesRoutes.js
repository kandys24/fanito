const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');

// Route to get all tax settings for a company
router.get('/get-taxes', authenticateUser, async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const cid = companyId;

    try {
        const taxSettings = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id, name AS taxName, default_value AS defaultValue, value AS rate FROM mytaxes WHERE cid = ?',
                [cid],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
        res.status(200).json({ taxes: taxSettings });
    } catch (err) {
        console.error('Error fetching tax settings:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to create or update tax settings for a company
router.post('/update-taxes', authenticateUser, async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const cid = companyId;
    const taxes = req.body;

    try {
        // Begin transaction
        await db.beginTransaction();

        // Clear existing taxes for the company
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM mytaxes WHERE cid = ?', [cid], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Insert or update new tax settings
        const insertTaxQuery = `
            INSERT INTO mytaxes (cid, name, default_value, value)
            VALUES (?, ?, ?, ?)
        `;
        // console.log(taxes)
        for (const tax of taxes) {
            const { taxName, defaultValue, rate } = tax;
            await new Promise((resolve, reject) => {
                db.query(insertTaxQuery, [cid, taxName, defaultValue || 0, rate], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }
        // Commit transaction
        await db.commit();
        res.status(200).json({ message: 'Tax settings updated successfully' });

    } catch (err) {
        // Rollback transaction in case of error
        await db.rollback();
        console.error('Error updating tax settings:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to delete a specific tax setting by its ID
router.delete('/delete-tax/:id', authenticateUser, async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const { id } = req.params;

    // console.log(companyId);
    try {
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM mytaxes WHERE cid = ? AND id = ?', [companyId, id], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        res.status(200).json({ message: 'Tax setting deleted successfully' });
    } catch (err) {
        console.error('Error deleting tax setting:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;