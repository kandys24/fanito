const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');

// Function to generate an expense code
const createExpenseCode = async (company_id) => {
    let prefix = 'EXP';

    try {
        const max_code = await new Promise((resolve, reject) => {
            db.query(`
                SELECT expense_code FROM expenses 
                WHERE company_id = ?
                ORDER BY CAST(SUBSTRING_INDEX(expense_code, '/', -1) AS UNSIGNED) DESC LIMIT 1;`,
                [company_id],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.length > 0 ? result[0].expense_code : null);
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

        return `${prefix} ${company_id}/${next_id}`;
    } catch (err) {
        console.error('Error generating expense code:', err);
        throw err;
    }
};

// POST route to add a new expense
router.post('/add-expense', authenticateUser, async (req, res) => {
    try {
        const { companyId } = req;
        const {
            document_date, payment_method, description, amount, obs
        } = req.body;

        // Generate expense_code based on companyId
        const expense_code = await createExpenseCode(companyId);

        // Insert the new expense record into the database
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO expenses (expense_code, company_id, document_date, payment_method, description, amount, obs)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    expense_code, companyId, document_date, payment_method, description, amount, obs
                ],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Respond with success
        res.status(201).json({ message: 'Expense added successfully' });
    } catch (error) {
        console.error('Error adding expense:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route to get expenses with pagination and search
router.get('/expenses', authenticateUser, async (req, res) => {
    const { companyId } = req; // Assuming companyId comes from the authenticated user
    const { page = 1, limit = 10, search = '' } = req.query;

    const offset = (page - 1) * limit;

    try {
        const searchQuery = `
            SELECT * FROM expenses 
            WHERE company_id = ? 
            AND (expense_code LIKE ? OR description LIKE ?)
            ORDER BY expense_id DESC
            LIMIT ? OFFSET ?
        `;
        const searchValue = `%${search}%`;

        // Fetch the expenses based on search, company, and pagination
        const expenses = await new Promise((resolve, reject) => {
            db.query(
                searchQuery,
                [companyId, searchValue, searchValue, parseInt(limit), parseInt(offset)],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });

        // Get the total number of matching expenses for pagination
        const totalExpenses = await new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) AS count FROM expenses WHERE company_id = ? AND (expense_code LIKE ? OR description LIKE ?)`,
                [companyId, searchValue, searchValue],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0].count);
                }
            );
        });

        res.status(200).json({
            expenses,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalExpenses / limit),
        });
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to get expense details
router.get('/expense/:expenseId', authenticateUser, async (req, res) => {
    const { expenseId } = req.params; // Get the expense ID from the request params
    const { companyId } = req; // Get the company ID from the authenticated user

    try {
        const expenseQuery = `SELECT * FROM expenses WHERE expense_id = ? AND company_id = ?`;
        
        // Fetch the expense from the database
        const [expense] = await new Promise((resolve, reject) => {
            db.query(expenseQuery, [expenseId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Send back the expense details
        res.status(200).json(expense);
    } catch (err) {
        console.error('Error fetching expense:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to update the status of an expense to 'canceled'
router.put('/update-expense-status/:expenseId', authenticateUser, async (req, res) => {
    const { expenseId } = req.params; // Get the expense ID from the request params
    const { companyId } = req; // Get the company ID from the authenticated user

    try {
        // Check if the expense exists for the company
        const expenseQuery = `SELECT * FROM expenses WHERE expense_id = ? AND company_id = ?`;
        const [existingExpense] = await new Promise((resolve, reject) => {
            db.query(expenseQuery, [expenseId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // console.log(existingExpense)

        if (!existingExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Update the status to 'canceled'
        const updateQuery = `
            UPDATE expenses 
            SET status = 'canceled'
            WHERE expense_id = ? AND company_id = ?
        `;

        await new Promise((resolve, reject) => {
            db.query(updateQuery, [expenseId, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json({ message: 'Expense status updated to canceled successfully' });
    } catch (err) {
        console.error('Error updating expense status:', err);
        res.status(500).json({ error: 'Database error' });
    }
});



module.exports = router;