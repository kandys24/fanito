const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

const createItemCode = async (unit, companyId) => {
    // Prefix logic based on unit type and company ID
    let prefix = unit === 'Unidade' ? `FU${companyId}` : `FS${companyId}`;

    try {
        // Query to get the max item code for the given prefix
        const max_code = await new Promise((resolve, reject) => {
            db.query(
                `SELECT code FROM items 
                    WHERE code LIKE ? 
                    ORDER BY CAST(SUBSTRING_INDEX(code, 'A0', -1) AS UNSIGNED) DESC LIMIT 1;`, 
                [`${prefix}A0%`], // Query to match codes starting with the specific prefix
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.length > 0 ? result[0].code : null);
                }
            );
        });

        let next_id = 1; // Default start for the next item number

        // If there's already an item code, extract the next_id from it
        if (max_code) {
            // Extract the number part after the prefix and "A0"
            const match = max_code.match(/A0(\d+)$/);
            if (match) {
                next_id = parseInt(match[1], 10) + 1; // Increment the number by 1
            }
        }

        // Return the formatted item code
        return `${prefix}A0${next_id}`;
    } catch (err) {
        console.error('Error generating item code:', err);
        throw err;
    }
};


// Route to a specific get code
// Updated API route using createItemCode function
router.get('/ge-tcode', authenticateUser, async (req, res) => {
    const { userId, companyId } = req;
    const { unit } = req.query;

    try {
        // Generate the item code using the helper function
        const code = await createItemCode(unit, companyId);

        // Respond with the generated code
        res.status(200).json({ code });
    } catch (err) {
        console.error('Error generating code:', err);
        res.status(500).json({ error: 'Database error' });
    }
});


// Route to insert a new item
router.post('/create-item', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const { codigo, descricao, unidade, retencao, precoUnitario, taxaIva, motivoIsenção, pvp, quantity } = req.body;

    // Server-side validation
    if (!codigo || !descricao || !unidade || !precoUnitario || !taxaIva) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const insertQuery = `
            INSERT INTO items (cid, code, description, unit, retention, unit_price, tax_rate, exemption_reason, pvp, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(
                insertQuery,
                [ companyId, codigo, descricao, unidade, retencao, precoUnitario, taxaIva, motivoIsenção || '', pvp || null, quantity ],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        res.status(201).json({ message: 'Item created successfully', itemId: result.insertId });
    } catch (err) {
        console.error('Error inserting item:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get items with pagination and search
router.get('/items', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * limit;

    try {
        const searchQuery = `
            SELECT * FROM items 
            WHERE cid = ? 
            AND (code LIKE ? OR description LIKE ?)
            LIMIT ? OFFSET ?
        `;
        const searchValue = `%${search}%`;

        const items = await new Promise((resolve, reject) => {
            db.query(
                searchQuery,
                [companyId, searchValue, searchValue, parseInt(limit), parseInt(offset)],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        const totalItems = await new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS count FROM items WHERE cid = ? AND (code LIKE ? OR description LIKE ?)`,
                [companyId, searchValue, searchValue],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0].count);
                }
            );
        });

        res.status(200).json({
            items,
            totalItems,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItems / limit),
        });
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get item details
router.get('/items/:itemId', authenticateUser, async (req, res) => {
    const { itemId } = req.params;
    const { companyId } = req;

    try {
        const itemQuery = `SELECT * FROM items WHERE item_id = ? AND cid = ?`;
        const [item] = await new Promise((resolve, reject) => {
            db.query(itemQuery, [itemId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to update an item
router.put('/update-item/:itemId', authenticateUser, async (req, res) => {
    const { itemId } = req.params;
    const { companyId } = req;
    const { codigo, descricao, unidade, retencao, precoUnitario, taxaIva, motivoIsenção, pvp, quantity } = req.body;

    try {
        // Check if the item exists
        const itemQuery = `SELECT * FROM items WHERE item_id = ? AND cid = ?`;
        const [existingItem] = await new Promise((resolve, reject) => {
            db.query(itemQuery, [itemId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (!existingItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Update the item
        const updateQuery = `
            UPDATE items 
            SET code = ?, description = ?, unit = ?, retention = ?, unit_price = ?, tax_rate = ?, exemption_reason = ?, pvp = ?, quantity = ?
            WHERE item_id = ? AND cid = ?
        `;

        await new Promise((resolve, reject) => {
            db.query(
                updateQuery,
                [codigo, descricao, unidade, retencao, precoUnitario, taxaIva, motivoIsenção, pvp || null, quantity, itemId, companyId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        res.status(200).json({ message: 'Item updated successfully' });
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get filtered items with pagination and search
router.get('/filter-items', authenticateUser, async (req, res) => {
    const { companyId } = req;
    const { page = 1, limit = 10, search = '', filter = {} } = req.query;

    const offset = (page - 1) * limit;

    // Construct the WHERE clause for search and filters
    let whereClauses = ['cid = ?'];
    let queryParams = [companyId];

    if (search) {
        whereClauses.push('(code LIKE ? OR description LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add filters if any
    if (filter.unidade) {
        whereClauses.push('unit = ?');
        queryParams.push(filter.unidade);
    }

    if (filter.minPrice) {
        whereClauses.push('unit_price >= ?');
        queryParams.push(filter.minPrice);
    }

    if (filter.maxPrice) {
        whereClauses.push('unit_price <= ?');
        queryParams.push(filter.maxPrice);
    }

    // Join the WHERE clauses into a single query string
    const whereClause = whereClauses.join(' AND ');

    try {
        // Query for filtered items
        const searchQuery = `
            SELECT * FROM items 
            WHERE ${whereClause}
            LIMIT ? OFFSET ?
        `;
        const items = await new Promise((resolve, reject) => {
            db.query(
                searchQuery,
                [...queryParams, parseInt(limit), parseInt(offset)],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Query for the total count of items matching the filters
        const countQuery = `SELECT COUNT(*) AS count FROM items WHERE ${whereClause}`;
        const totalItems = await new Promise((resolve, reject) => {
            db.query(
                countQuery,
                queryParams,
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0].count);
                }
            );
        });

        res.status(200).json({
            items,
            totalItems,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItems / limit),
        });
    } catch (err) {
        console.error('Error fetching filtered items:', err);
        res.status(500).json({ error: 'Database error' });
    }
});



module.exports = router;