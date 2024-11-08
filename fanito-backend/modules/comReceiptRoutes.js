const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

// Function to generate a receipt code
const createReceiptCode = async (companyId, series) => {
    let prefix = 'RC';

    try {
        const max_code = await new Promise((resolve, reject) => {
            db.query(`
                SELECT receipt_code FROM receipts 
                WHERE series = ? AND company_id = ?
                ORDER BY CAST(SUBSTRING_INDEX(receipt_code, '/', -1) AS UNSIGNED) DESC LIMIT 1;`,
                [series, companyId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.length > 0 ? result[0].receipt_code : null);
                }
            );
        });

        let next_id = 1;
        if (max_code) {
            const match = max_code.match(/\/(\d+)$/);
            if (match) {
                next_id = parseInt(match[1], 10) + 1;
            }
        }

        return `${prefix} ${series}/${next_id}`;
    } catch (err) {
        console.error('Error generating receipt code:', err);
        throw err;
    }
};


// POST route to add a new receipt
router.post('/add-receipt', authenticateUser, async (req, res) => {
    const { companyId } = req;
    
    try {
        const {
            invoice_id, document_date, payment_method, series, paid, obs
        } = req.body;

        const receipt_code = await createReceiptCode(companyId, series);

        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO receipts (company_id, receipt_code, invoice_id, document_date, payment_method, series, paid, obs)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    companyId, receipt_code, invoice_id, document_date, payment_method, series, paid, obs
                ],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        res.status(201).json({ message: 'Receipt added successfully' });
    } catch (error) {
        console.error('Error adding receipt:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET route to fetch a single invoice by ID and a specific receipt by receipt ID
router.get('/invoice/:id/receipt/:receiptId', authenticateUser, async (req, res) => {
    const { id, receiptId } = req.params; // Get both invoice ID and receipt ID from URL parameters
    const { companyId } = req;

    try {
        // Fetch invoice details
        const invoiceQuery = `
            SELECT i.*, c.client_name, c.client_tax_id, c.client_email, c.client_address, 
                   c.client_po_box, c.client_city
            FROM invoices i
            LEFT JOIN invoiceclients c ON i.invoice_id = c.invoice_id
            WHERE i.company_id = ? AND i.invoice_id = ?
        `;

        const invoice = await new Promise((resolve, reject) => {
            db.query(invoiceQuery, [companyId, id], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Fetch invoice items
        const itemsQuery = `
            SELECT * FROM invoiceitems
            WHERE invoice_id = ?
        `;

        const items = await new Promise((resolve, reject) => {
            db.query(itemsQuery, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const companyDetailsQuery = `
            SELECT 
                cid, 
                companyName, 
                taxpayerNumber, 
                address, 
                vatScheme, 
                email, 
                website, 
                phone, 
                fax, 
                city, 
                imgUrl
            FROM 
                companyDetails
            WHERE 
                cid = ?
        `;

        const companyDetails = await new Promise((resolve, reject) => {
            db.query(companyDetailsQuery, [companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        if (!companyDetails) {
            return res.status(404).json({ message: 'Company details not found' });
        }

        // Fetch bank accounts
        const bankAccountsQuery = `
            SELECT 
                account_id, 
                bankName, 
                accountNumber, 
                iban, 
                created_at AS bankAccountCreatedAt
            FROM 
                bankAccounts
            WHERE 
                cid = ?
        `;

        const bankAccounts = await new Promise((resolve, reject) => {
            db.query(bankAccountsQuery, [companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Fetch document customizations
        const docCustomizationQuery = `
            SELECT 
                logoUrl, 
                observations, 
                footer, 
                created_at AS docCreatedAt,
                updated_at AS docUpdatedAt
            FROM 
                doccustomization
            WHERE 
                cid = ?
        `;

        const docCustomizations = await new Promise((resolve, reject) => {
            db.query(docCustomizationQuery, [companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        // Fetch all receipts for the invoice and total paid
        const queryReceipt = `
            SELECT r.*, 
                (SELECT SUM(paid) 
                    FROM receipts 
                    WHERE invoice_id = ? 
                    AND status = 'final') AS totalpaid 
            FROM receipts r 
            WHERE r.invoice_id = ?;
        `;

        const resultsReceipts = await new Promise((resolve, reject) => {
            db.query(queryReceipt, [id, id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Destructure to get totalpaid and payments
        const totalpaid = resultsReceipts.length > 0 ? resultsReceipts[0].totalpaid : 0;
        const payments = resultsReceipts;
        const receipts = { totalpaid, payments };

        // Fetch the specific receipt by its ID
        const specificReceiptQuery = `
            SELECT * 
            FROM receipts
            WHERE invoice_id = ? AND receipt_id = ?;
        `;

        const receipt = await new Promise((resolve, reject) => {
            db.query(specificReceiptQuery, [id, receiptId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]); // Expecting a single row for a specific receipt
            });
        });

        if (!receipt) {
            return res.status(404).json({ message: 'Specific receipt not found' });
        }

        // Fetch the specific cancellation Reason
        const cancellationReasonQuery = `
            SELECT * 
            FROM cancellations
            WHERE doc_code = ? AND document_type = ?;
        `;

        const cancellationReason = await new Promise((resolve, reject) => {
            db.query(cancellationReasonQuery, [receipt.receipt_code, receipt.document_type], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]); // Expecting a single row for a specific receipt
            });
        });

        // Return full invoice details, company details, and the specific receipt
        res.status(200).json({ 
            invoice, 
            items, 
            companyDetails, 
            bankAccounts, 
            docCustomizations, 
            receipts, 
            receipt,
            cancellationReason 
        });
    } catch (err) {
        console.error('Error fetching invoice or receipt:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


module.exports = router;