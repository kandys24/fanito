const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');

// Route to insert a new client
router.post('/create-client', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const {
        name, tipo, tipoDoc, numeroDoc, endereco, caixaPostal, pais, cidade, email, telefone, telemovel, fax, website,
        numCopias, vencimento, idioma, meioPagamento, observacoes, moeda
    } = req.body;

    const type = tipo, document_type = tipoDoc, document_number = numeroDoc,  address = endereco, postal_box = caixaPostal, country = pais;
    const city = cidade, phone = telefone, mobile = telemovel, copies = numCopias, payment_due = vencimento, language = idioma;
    const payment_method = meioPagamento, observations = observacoes, currency = moeda;

    // Server-side validation
    // if (!name || !document_number || !address || !email || !phone) {
    //     console.log(companyId)
    //     return res.status(400).json({ error: 'Missing required fields' });
    // }

    try {
        const insertClientQuery = `
            INSERT INTO clientData (cid, name, type, document_type, document_number, address, postal_box, country, city, email, phone, mobile, fax, website)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const clientResult = await new Promise((resolve, reject) => {
            db.query(
                insertClientQuery,
                [companyId, name, type || 'Normal', document_type || 'Contribuinte', document_number, address, postal_box || null, country || 'Angola', city || 'Luanda', email, phone, mobile || null, fax || null, website || null],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const clientId = clientResult.insertId;

        const insertBillingPreferencesQuery = `
            INSERT INTO billingPreferences (client_id, cid, copies, payment_due, language, payment_method, observations, currency)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await new Promise((resolve, reject) => {
            db.query(
                insertBillingPreferencesQuery,
                [clientId, companyId, copies || 'Original', payment_due || 'Pronto Pagamento', language || 'Português', payment_method || 'Numerário', observations || null, currency || 'Angolan kwanza (AOA)'],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        res.status(201).json({ message: 'Client created successfully', clientId });
    } catch (err) {
        console.error('Error inserting client:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get clients with pagination and search
router.get('/clients', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * limit;

    try {
        const searchQuery = `
            SELECT * FROM clientData 
            WHERE cid = ? 
            AND (name LIKE ? OR email LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchValue = `%${search}%`;

        const clients = await new Promise((resolve, reject) => {
            db.query(
                searchQuery,
                [companyId, searchValue, searchValue, parseInt(limit), parseInt(offset)],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const totalClients = await new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS count FROM clientData WHERE cid = ? AND (name LIKE ? OR email LIKE ?)`,
                [companyId, searchValue, searchValue],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0].count);
                }
            );
        });

        res.status(200).json({
            clients,
            totalClients,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalClients / limit),
        });
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get client details
router.get('/clients/:clientId', authenticateUser, async (req, res) => {
    const { clientId } = req.params;
    const { companyId } = req;

    try {
        const clientQuery = `
            SELECT * FROM clientData WHERE client_id = ? AND cid = ?
        `;
        const billingPreferencesQuery = `
            SELECT * FROM billingPreferences WHERE client_id = ? AND cid = ?
        `;

        const [client] = await new Promise((resolve, reject) => {
            db.query(clientQuery, [clientId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const [billingPreferences] = await new Promise((resolve, reject) => {
            db.query(billingPreferencesQuery, [clientId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.status(200).json({ ...client, billingPreferences });
    } catch (err) {
        console.error('Error fetching client:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to update a client
router.put('/update-client/:clientId', authenticateUser, async (req, res) => {
    const { clientId } = req.params;
    const { companyId } = req;
    const {
        name, tipo, tipoDoc, numeroDoc, endereco, caixaPostal, pais, cidade, email, telefone, telemovel, fax, website,
        numCopias, vencimento, idioma, meioPagamento, observacoes, moeda
    } = req.body;

    const type = tipo, document_type = tipoDoc, document_number = numeroDoc,  address = endereco, postal_box = caixaPostal, country = pais;
    const city = cidade, phone = telefone, mobile = telemovel, copies = numCopias, payment_due = vencimento, language = idioma;
    const payment_method = meioPagamento, observations = observacoes, currency = moeda;
    // console.log(clientId)

    try {
        // Check if the client exists
        const clientQuery = `SELECT * FROM clientData WHERE client_id = ? AND cid = ?`;
        const [existingClient] = await new Promise((resolve, reject) => {
            db.query(clientQuery, [clientId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (!existingClient) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Update the client
        const updateClientQuery = `
            UPDATE clientData 
            SET name = ?, type = ?, document_type = ?, document_number = ?, address = ?, postal_box = ?, country = ?, city = ?, email = ?, phone = ?, mobile = ?, fax = ?, website = ?
            WHERE client_id = ? AND cid = ?
        `;

        await new Promise((resolve, reject) => {
            db.query(
                updateClientQuery,
                [name, type || 'Normal', document_type || 'Contribuinte', document_number, address, postal_box || null, country || 'Angola', city || 'Luanda', email, phone, mobile || null, fax || null, website || null, clientId, companyId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Update the billing preferences
        const updateBillingPreferencesQuery = `
            UPDATE billingPreferences 
            SET copies = ?, payment_due = ?, language = ?, payment_method = ?, observations = ?, currency = ?
            WHERE client_id = ? AND cid = ?
        `;

        await new Promise((resolve, reject) => {
            db.query(
                updateBillingPreferencesQuery,
                [copies || 'Original', payment_due || 'Pronto Pagamento', language || 'Português', payment_method || 'Numerário', observations || null, currency || 'Angolan kwanza (AOA)', clientId, companyId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        res.status(200).json({ message: 'Client updated successfully' });
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get clients with pagination and search, including billingPreferences
router.get('/clients-invo', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * limit;

    try {
        const searchQuery = `
            SELECT clientData.*, billingPreferences.*
            FROM clientData
            LEFT JOIN billingPreferences ON clientData.client_id = billingPreferences.client_id
            WHERE clientData.cid = ? 
            AND (clientData.name LIKE ? OR clientData.email LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchValue = `%${search}%`;

        const clients = await new Promise((resolve, reject) => {
            db.query(
                searchQuery,
                [companyId, searchValue, searchValue, parseInt(limit), parseInt(offset)],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const totalClients = await new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS count 
                 FROM clientData 
                 WHERE cid = ? 
                 AND (name LIKE ? OR email LIKE ?)`,
                [companyId, searchValue, searchValue],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0].count);
                }
            );
        });

        res.status(200).json({
            clients,
            totalClients,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalClients / limit),
        });
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({ error: 'Database error' });
    }
});


module.exports = router;
