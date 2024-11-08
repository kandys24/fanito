const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');

// POST route to add a new cancellation
router.post('/add-cancellation', authenticateUser, async (req, res) => {
    const { companyId } = req;

    try {
        const { doc_id, doc_code, document_type, cancellation_reason } = req.body;

        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO cancellations (company_id, doc_code, document_type, cancellation_reason)
                VALUES (?, ?, ?, ?)`,
                [companyId, doc_code, document_type, cancellation_reason],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Update the invoice status
        const updateQuery = `
            UPDATE ${document_type === 'Receipt' ?'receipts' :'invoices'}
            SET status = ?
            WHERE ${document_type === 'Receipt' ?'receipt_id' :'invoice_id'} = ?
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery, ['canceled', doc_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(201).json({ message: 'Cancellation added successfully' });
    } catch (error) {
        console.error('Error adding cancellation:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET route to fetch cancellations by doc_code or document_type
router.get('/cancellations', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const { doc_code, document_type } = req.query;

    let query = `SELECT * FROM cancellations WHERE 1=1`; // Basic query to fetch all cancellations
    const params = [];

    // Add filtering conditions based on query parameters
    if (doc_code) {
        query += ` AND doc_code = ?`;
        params.push(doc_code);
    }

    if (document_type) {
        query += ` AND document_type = ?`;
        params.push(document_type);
    }

    try {
        const cancellations = await new Promise((resolve, reject) => {
            db.query(query, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (cancellations.length === 0) {
            return res.status(404).json({ message: 'No cancellations found' });
        }

        res.status(200).json(cancellations);
    } catch (error) {
        console.error('Error fetching cancellations:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;