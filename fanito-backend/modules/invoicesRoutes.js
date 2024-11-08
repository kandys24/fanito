const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

// Function to generate an invoice code
const createInvoCode = async (document_type, series, companyId) => {
    let prefix = document_type === 'Proforma' ? `PP` : document_type === 'Invoice' ? `FT` : document_type === 'Invoice-Receipt' ? `FR` : document_type === 'Credit-Note'? `NC` : document_type === 'Order' ? `GR` : `GT`;

    try {
        // Query to get the max invoice_code for the given document_type and series
        const max_code = await new Promise((resolve, reject) => {
            db.query(
                `SELECT invoice_code FROM invoices 
                    WHERE document_type = ? AND series = ? AND company_id = ?
                    ORDER BY CAST(SUBSTRING_INDEX(invoice_code, '/', -1) AS UNSIGNED) DESC LIMIT 1;`, 
                [document_type, series, companyId], // Query to select both document_type and series
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.length > 0 ? result[0].invoice_code : null);
                }
            );
        });

        let next_id = 1; // Default start for the next invoice number

        // If there's already an invoice_code, extract the next_id from it
        if (max_code) {
            // Extract the number part after the series
            const match = max_code.match(/\/(\d+)$/);
            if (match) {
                next_id = parseInt(match[1], 10) + 1; // Increment the number by 1
            }
        }

        // Return the formatted invoice code
        return `${prefix} ${series}/${next_id}`;
    } catch (err) {
        console.error('Error generating invoice code:', err);
        throw err;
    }
};



// POST route to add a new invoice
router.post('/add-invoice', authenticateUser, async (req, res) => {
    const { companyId } = req;
    try {
        const {
            client_id, client_name, client_tax_id, client_email, client_address, client_po_box, client_city, 
            document_type, document_style, document_date, due_date,
            payment_method, series, remarks, retention_percentage, status, total_amount, retention_amount, taxable_amount, tax_amount, refcode,
            items
        } = req.body;

        const invoice_code = await createInvoCode(document_type, series, companyId);

        // Insert invoice details into the invoices table
        const invoiceResult = await new Promise((resolve, reject) => {
            db.query(`
            INSERT INTO invoices (invoice_code, company_id, client_id, document_type, document_style, document_date, due_date, payment_method, series, remarks, retention_percentage, status, total_amount, retention_amount, taxable_amount, tax_amount, refcode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            invoice_code, companyId, client_id || 0, document_type, document_style, document_date, due_date, payment_method, series, remarks, retention_percentage, document_type === 'Invoice' ? status : 'final', total_amount, retention_amount, taxable_amount, tax_amount, refcode || null
        ],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const invoice_id = invoiceResult.insertId;

        if (!invoice_id) {
            throw new Error('Failed to retrieve invoice ID after inserting invoice');
        }

        // Insert client details into the invoiceclients table
        await new Promise((resolve, reject) => {
            db.query(`
                    INSERT INTO invoiceclients (invoice_id, clid_id, client_name, client_tax_id, client_email, client_address, client_po_box, client_city)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    invoice_id, client_id || 0, client_name, client_tax_id, client_email, client_address, client_po_box, client_city
                ], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Insert each item into the invoiceitems table
        for (const item of items) {
            // console.log(typeof(item.exemption_reason), item.exemption_reason);
            // let helper = 'Transmissão de bens e serviço não sujeita'
            await new Promise((resolve, reject) => {
                db.query(`
                        INSERT INTO invoiceitems (invoice_id, itid, item_code, description, unit_price, quantity, discount_amount, tax_rate, exemption_reason, total_price)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        invoice_id, item.item_id, item.code, item.description, item.unit_price, item.qtd, item.desconto, item.tax_rate, item.exemption_reason, item.unit_price*item.qtd
                    ], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    }
                );
            });
        }

        // to put the paid amount if it is Invoice Receipt
        if(document_type === 'Invoice-Receipt'){
            addReceipt(companyId, invoice_id, document_date, payment_method, series, total_amount, remarks)
        }
        
        res.status(201).json({ message: 'Invoice, client, and items added successfully', invoice_id });
    } catch (error) {
        // console.error('Error adding invoice and client:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// get route to search and show to users invoice
router.get('/ge-tinvoices', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const { page = 1, limit = 10, search = '', invotype } = req.query;

    const offset = (page - 1) * limit;

    try {
        // Split the invotype string into an array of document types
        const documentTypes = invotype.split(' ').filter(type => type.trim() !== '');

        // Construct the `IN` clause placeholders dynamically based on the number of document types
        const inClausePlaceholders = documentTypes.map(() => '?').join(', ');

        // Query to fetch invoices along with related clients and total paid
        const searchQuery = `
            SELECT i.*, c.client_name, c.client_tax_id, c.client_email, c.client_address, 
                   c.client_po_box, c.client_city,
                   IFNULL(SUM(r.paid), 0) AS total_paid
            FROM invoices i
            LEFT JOIN invoiceclients c ON i.invoice_id = c.invoice_id
            LEFT JOIN receipts r ON i.invoice_id = r.invoice_id AND r.status = 'final'
            WHERE i.company_id = ? 
            AND (i.invoice_code LIKE ? OR c.client_name LIKE ?)
            AND i.document_type IN (${inClausePlaceholders})
            GROUP BY i.invoice_id
            ORDER BY i.invoice_id DESC
            LIMIT ? OFFSET ?
        `;

        const searchValue = `%${search}%`;

        const invoices = await new Promise((resolve, reject) => {
            db.query(
                searchQuery,
                [companyId, searchValue, searchValue, ...documentTypes, parseInt(limit), parseInt(offset)],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const totalInvoices = await new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(DISTINCT i.invoice_id) AS count
                    FROM invoices i
                    LEFT JOIN invoiceclients c ON i.invoice_id = c.invoice_id
                WHERE i.company_id = ? 
                AND (i.invoice_id LIKE ? OR c.client_name LIKE ?)
                AND i.document_type IN (${inClausePlaceholders})`,
                [companyId, searchValue, searchValue, ...documentTypes],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0].count);
                }
            );
        });

        res.status(200).json({
            invoices,
            totalInvoices,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalInvoices / limit),
        });
    } catch (err) {
        console.error('Error fetching invoices:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET route to fetch a single invoice by ID
router.get('/invoice/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
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

        // Fetch receipt
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
        const totalpaid = resultsReceipts.length > 0 ? resultsReceipts[0].totalpaid : 0; // Handle case with no rows
        const payments = resultsReceipts; // Payments will contain all rows

        const receipts = { totalpaid, payments };

        // console.log(resultsReceipts)

        // Fetch the specific cancellation Reason
        const cancellationReasonQuery = `
            SELECT * 
            FROM cancellations
            WHERE doc_code = ? AND document_type = ?;
        `;

        const cancellationReason = await new Promise((resolve, reject) => {
            db.query(cancellationReasonQuery, [invoice.invoice_code, invoice.document_type], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]); // Expecting a single row for a specific receipt
            });
        });

        res.status(200).json({ invoice, items, companyDetails, bankAccounts, docCustomizations, receipts, cancellationReason });
    } catch (err) {
        console.error('Error fetching invoice:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT route to update the invoice status
router.put('/invoice/:id/status', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { companyId } = req;

    if (status !== 'final') {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Update the invoice status
        const updateQuery = `
            UPDATE invoices
            SET status = ?
            WHERE company_id = ? AND invoice_id = ?
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery, [status, companyId, id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({ message: 'Invoice status updated successfully' });
    } catch (err) {
        console.error('Error updating invoice status:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT route to update the invoice status
router.put('/invoice/:id/itype', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { itype } = req.body;
    const { companyId } = req;

    if (itype !== 'Invoice') {
        return res.status(400).json({ message: 'Invalid document type' });
    }
    

    try {
        // Fetch invoice series
        const itemsQuery = `
            SELECT series FROM invoices
            WHERE invoice_id = ?
        `;

        const series = await new Promise((resolve, reject) => {
            db.query(itemsQuery, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result[0].series);
            });
        });

        if (!series) {
            return res.status(400).json({ message: 'Invalid series' });
        }

        const invoice_code = await createInvoCode(itype, series, companyId);

        // Update the invoice itype
        const updateQuery = `
            UPDATE invoices
            SET document_type = ?, invoice_code = ?
            WHERE company_id = ? AND invoice_id = ?
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery, [itype, invoice_code, companyId, id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({ message: 'Invoice document_type updated successfully' });
    } catch (err) {
        console.error('Error updating invoice status:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE route to delete an invoice
router.delete('/apagarinvoice/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req;

    try {
        // Delete the invoice
        const deleteQuery = `
            DELETE FROM invoices
            WHERE company_id = ? AND invoice_id = ?
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(deleteQuery, [companyId, id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (err) {
        console.error('Error deleting invoice:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Route to fetch invoice summary
// Route to fetch invoice summary with dynamic due date calculation
router.get('/summary', authenticateUser, async (req, res) => {
    const { companyId } = req;

    try {
        // Fetch invoice summary data from the database with due date calculation
        const summaryQuery = `
            SELECT 
                SUM(CASE WHEN status = 'draft' AND document_type != 'Proforma' THEN total_amount ELSE 0 END) as draft_total,
                SUM(CASE WHEN status = 'canceled' AND document_type != 'Proforma' AND document_type != 'Credit-Note' THEN total_amount ELSE 0 END) as canceled_total,
                SUM(CASE WHEN status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note' AND DATE_ADD(document_date, INTERVAL
                    CASE 
                        WHEN due_date = 'Pronto Pagamento' THEN 0
                        WHEN due_date = '15 Dias' THEN 15
                        WHEN due_date = '30 Dias' THEN 30
                        WHEN due_date = '45 Dias' THEN 45
                        WHEN due_date = '60 Dias' THEN 60
                        WHEN due_date = '90 Dias' THEN 90
                        ELSE 0 -- Default case if due_date doesn't match
                    END DAY) >= CURDATE() THEN total_amount ELSE 0 END) as within_due_date_total,
                SUM(CASE WHEN status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note' AND DATE_ADD(document_date, INTERVAL
                    CASE 
                        WHEN due_date = 'Pronto Pagamento' THEN 0
                        WHEN due_date = '15 Dias' THEN 15
                        WHEN due_date = '30 Dias' THEN 30
                        WHEN due_date = '45 Dias' THEN 45
                        WHEN due_date = '60 Dias' THEN 60
                        WHEN due_date = '90 Dias' THEN 90
                        ELSE 0 -- Default case if due_date doesn't match
                    END DAY) < CURDATE() THEN total_amount ELSE 0 END) as overdue_total,
                SUM(CASE WHEN status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note' THEN total_amount ELSE 0 END) as final_total,
                SUM(CASE WHEN document_type != 'Proforma' AND document_type != 'Credit-Note' THEN taxable_amount ELSE 0 END) as total_without_tax,
                SUM(CASE WHEN document_type != 'Proforma' AND document_type != 'Credit-Note' THEN tax_amount ELSE 0 END) as total_tax,
                (SELECT SUM(paid) FROM receipts r JOIN invoices i ON r.invoice_id = i.invoice_id WHERE i.company_id = ?) as total_paid,
                COUNT(CASE WHEN document_type != 'Proforma' AND status != 'deleted' THEN 1 ELSE NULL END) as total_invoices
            FROM invoices
            WHERE company_id = ?
        `;

        const [summaryData] = await new Promise((resolve, reject) => {
            db.query(summaryQuery, [companyId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json({ summary: summaryData });
    } catch (err) {
        console.error('Error fetching invoice summary:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

/* Receipt */

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


// to add a new receipt
const addReceipt = async (companyId, invoice_id, document_date, payment_method, series, paid, obs) => {
    try {

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

        return true
    } catch (error) {
        console.error('Error adding receipt:', error.message);
        return false
    }
};


module.exports = router;


// Query to fetch invoices along with related clients and items
// const searchQuery = `
//     SELECT i.*, c.client_name, c.client_tax_id, c.client_email, c.client_address, 
//         c.client_po_box, c.client_city, 
//         JSON_ARRAYAGG(JSON_OBJECT(
//             'item_id', it.item_id,
//             'item_code', it.item_code,
//             'description', it.description,
//             'unit_price', it.unit_price,
//             'quantity', it.quantity,
//             'discount_amount', it.discount_amount,
//             'tax_rate', it.tax_rate,
//             'total_price', it.total_price
//         )) AS items
//     FROM invoices i
//     LEFT JOIN invoiceclients c ON i.invoice_id = c.invoice_id
//     LEFT JOIN invoiceitems it ON i.invoice_id = it.invoice_id
//     WHERE i.company_id = ? 
//     AND (i.document_type LIKE ? OR c.client_name LIKE ?)
//     GROUP BY i.invoice_id
//     LIMIT ? OFFSET ?
// `;