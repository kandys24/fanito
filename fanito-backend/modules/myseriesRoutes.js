const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

// Route to get all series settings for a company
router.get('/get-series', authenticateUser, async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const cid = companyId;

    try {
        const seriesSettings = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id, name As serieName, default_value AS defaultValue, created_at AS createdAt FROM myseries WHERE cid = ?',
                [cid],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
        res.status(200).json({ series: seriesSettings });
    } catch (err) {
        console.error('Error fetching series settings:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to create or update series settings for a company
router.post('/update-series', authenticateUser, async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const cid = companyId;
    const series = req.body;

    try {
        // Begin transaction
        await db.beginTransaction();

        // Clear existing series for the company
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM myseries WHERE cid = ?', [cid], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Insert or update new series settings
        const insertOrUpdateSeriesQuery = `
            INSERT INTO myseries (cid, name, default_value)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                default_value = VALUES(default_value)
        `;

        for (const serie of series) {
            const { serieName, defaultValue } = serie;
            await new Promise((resolve, reject) => {
                db.query(insertOrUpdateSeriesQuery, [cid, serieName, defaultValue || 0], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        // Commit transaction
        await db.commit();
        res.status(200).json({ message: 'Series settings updated successfully' });

    } catch (err) {
        // Rollback transaction in case of error
        await db.rollback();
        console.error('Error updating series settings:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to delete a specific series setting by its ID
router.delete('/delete-series/:id', authenticateUser, async (req, res) => {
    const { companyId } = req; // Extracting company ID from the authenticated user
    const { id } = req.params;

    try {
        await new Promise((resolve, reject) => {
            db.query('DELETE FROM myseries WHERE cid = ? AND id = ?', [companyId, id], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        res.status(200).json({ message: 'Series setting deleted successfully' });
    } catch (err) {
        console.error('Error deleting series setting:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
