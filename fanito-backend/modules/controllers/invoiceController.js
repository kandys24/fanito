const db = require('../db'); // Assume this is the database connection

exports.getTaxReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    const { companyId } = req; // Get companyId from the request

    const query = `
        SELECT SUM(tax_amount) AS total_tax
        FROM invoices
        WHERE status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note'
        AND company_id = ? AND document_date BETWEEN ? AND ?;
    `;
    try {
        db.query(query, [companyId, startDate, endDate], (err, results) => {
            if (err) {
                console.error('Error fetching tax report:', err);
                res.status(500).json({ error: 'Database error' });
                return;
            }

            res.json(results[0]);
        });
    } catch (error) {
        console.log(error)
    }
};

exports.getInvoiceTotalsReport = (req, res) => {
    const { startDate, endDate } = req.query;
    const { companyId } = req; // Get companyId from the request

    const query = `
        SELECT SUM(total_amount) AS total_invoices
        FROM invoices
        WHERE status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note'
        AND company_id = ? AND document_date BETWEEN ? AND ?;
    `;

    db.query(query, [companyId, startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching invoice totals report:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        // console.log(results)
        res.json(results[0]);
    });
};

// Total Paid
exports.getTotalPaidReport = (req, res) => {
    const { startDate, endDate } = req.query;
    const { companyId } = req;

    const query = `
        SELECT 
            SUM(inv.total_amount) AS total_invoices,   -- Sum of total invoice amounts
            IFNULL(SUM(rec.paid), 0) AS total_paid     -- Sum of paid amounts from receipts
        FROM invoices inv
        LEFT JOIN receipts rec ON inv.invoice_id = rec.invoice_id AND rec.status = 'final'
        WHERE inv.status = 'final' 
        AND inv.document_type != 'Proforma' 
        AND inv.document_type != 'Credit-Note'
        AND inv.company_id = ? 
        AND inv.document_date BETWEEN ? AND ?
    `;

    db.query(query, [companyId, startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching total paid report:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        // console.log(results)
        res.json(results[0]);
    });
};

// Example for client invoice report
exports.getClientInvoiceReport = (req, res) => {
    const { startDate, endDate } = req.query;
    const { companyId } = req;

    const query = `
        SELECT ic.client_name, SUM(i.total_amount) AS total_invoiced
        FROM invoices i
        JOIN invoiceclients ic ON i.invoice_id = ic.invoice_id
        WHERE i.status = 'final' 
        AND i.document_type != 'Proforma' 
        AND i.document_type != 'Credit-Note'
        AND i.company_id = ? 
        AND i.document_date BETWEEN ? AND ?
        GROUP BY ic.client_name
        ORDER BY total_invoiced DESC;   -- Order by total_invoiced in descending order
    `;

    db.query(query, [companyId, startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching client invoice report:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        res.json(results);
    });
};

exports.getPaymentMethodReport = (req, res) => {
    const { startDate, endDate } = req.query;
    const { companyId } = req; // Get companyId from the request

    const query = `
        SELECT payment_method, SUM(total_amount) AS total_invoiced
        FROM invoices
        WHERE company_id = ? AND document_date BETWEEN ? AND ?
        GROUP BY payment_method;
    `;

    db.query(query, [companyId, startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching payment method report:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        res.json(results);
    });
};

exports.getInvoiceStatusReport = (req, res) => {
    const { startDate, endDate } = req.query;
    const { companyId } = req; // Get companyId from the request

    const query = `
        SELECT status, COUNT(*) AS invoice_count, SUM(total_amount) AS total_invoiced
        FROM invoices
        WHERE company_id = ? AND document_date BETWEEN ? AND ?
        GROUP BY status;
    `;

    db.query(query, [companyId, startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching invoice status report:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        res.json(results);
    });
};


exports.getFinancialSummaryReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    const { companyId } = req; // Assuming companyId is available in the request (could be from auth middleware)

    try {
        // Query for Total Billing (only considering paid invoices from receipts)
        const billingQuery = `
            SELECT SUM(r.paid) AS total_billing
            FROM receipts r
            JOIN invoices i ON r.invoice_id = i.invoice_id
            WHERE i.company_id = ?
            AND i.status = 'final'
            AND r.status = 'final'
            AND r.document_date BETWEEN ? AND ?;
        `;

        const [billingResult] = await new Promise((resolve, reject) => {
            db.query(billingQuery, [companyId, startDate, endDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Query for Total Tax from the invoices
        const taxQuery = `
            SELECT SUM(i.tax_amount) AS total_tax
            FROM invoices i
            WHERE i.company_id = ?
            AND i.status = 'final'
            AND i.document_type != 'Proforma'
            AND i.document_type != 'Credit-Note'
            AND i.document_date BETWEEN ? AND ?;
        `;

        const [taxResult] = await new Promise((resolve, reject) => {
            db.query(taxQuery, [companyId, startDate, endDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Query for Total Expenses (based on expenses table)
        const expensesQuery = `
            SELECT SUM(e.amount) AS total_expenses
            FROM expenses e
            WHERE e.company_id = ? AND e.status = 'final'
            AND e.document_date BETWEEN ? AND ?;
        `;

        const [expensesResult] = await new Promise((resolve, reject) => {
            db.query(expensesQuery, [companyId, startDate, endDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Query for Payment Method Breakdown (from receipts)
        const paymentMethodQuery = `
            SELECT r.payment_method, SUM(r.paid) AS total_paid
            FROM receipts r
            JOIN invoices i ON r.invoice_id = i.invoice_id AND r.status = 'final'
            WHERE i.company_id = ?
            AND r.document_date BETWEEN ? AND ?
            GROUP BY r.payment_method;
        `;

        const paymentMethodResults = await new Promise((resolve, reject) => {
            db.query(paymentMethodQuery, [companyId, startDate, endDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Calculate Income: total_billing - total_tax - total_expenses
        const totalBilling = billingResult.total_billing || 0;
        const totalTax = taxResult.total_tax || 0;
        const totalExpenses = expensesResult.total_expenses || 0;
        const income = totalBilling - totalTax - totalExpenses;

        // console.log(paymentMethodResults)
        // Send the response
        res.json({
            totalBilling,
            totalTax,
            totalExpenses,
            income,
            paymentMethods: paymentMethodResults
        });
    } catch (error) {
        console.error('Error fetching financial summary report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getDailySalesReport = async (req, res) => {
    const { date } = req.query; // Expected in 'YYYY-MM-DD' format
    const { companyId } = req;

    try {
        const formattedDate = new Date(date).toISOString().slice(0, 10);

        const totalReceiptsQuery = `
            SELECT 
                COALESCE(SUM(CASE 
                    WHEN DATE(r.document_date) < ? THEN r.paid 
                    ELSE 0 END), 0) AS totalReceipts
            FROM receipts r
            JOIN invoices i ON r.invoice_id = i.invoice_id AND r.status = 'final'
            WHERE i.company_id = ?
            AND DATE(r.document_date) < ?
            AND i.status = 'final'
            AND i.document_type NOT IN ('Proforma', 'Credit-Note');
        `;

        const totalReceiptsResult = await new Promise((resolve, reject) => {
            db.query(totalReceiptsQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const totalExpensesQuery = `
            SELECT 
                COALESCE(SUM(CASE 
                    WHEN DATE(e.document_date) < ? THEN e.amount 
                    ELSE 0 END), 0) AS totalExpenses
            FROM expenses e
            WHERE e.company_id = ?
            AND DATE(e.document_date) < ?
            AND e.status = 'final';
        `;

        const totalExpensesResult = await new Promise((resolve, reject) => {
            db.query(totalExpensesQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Access the result directly without destructuring
        const openingCash = totalReceiptsResult[0]?.totalReceipts || 0;
        const openingExpenses = totalExpensesResult[0]?.totalExpenses || 0;

        const dailySalesQuery = `
            SELECT 
                COALESCE(SUM(CASE 
                    WHEN DATE(r.document_date) = ? THEN r.paid 
                    ELSE 0 END), 0) AS dailySalesTotal
            FROM receipts r
            JOIN invoices i ON r.invoice_id = i.invoice_id AND r.status = 'final'
            WHERE i.company_id = ?
            AND DATE(r.document_date) = ?
            AND i.status = 'final'
            AND i.document_type NOT IN ('Proforma', 'Credit-Note');
        `;

        const dailySalesResult = await new Promise((resolve, reject) => {
            db.query(dailySalesQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const dailyExpensesQuery = `
            SELECT 
                COALESCE(SUM(CASE 
                    WHEN DATE(e.document_date) = ? AND e.status = 'final' THEN e.amount 
                    ELSE 0 END), 0) AS dailyExpensesTotal
            FROM expenses e
            WHERE e.company_id = ?
            AND DATE(e.document_date) = ?
            AND e.status = 'final';
        `;

        const dailyExpensesResult = await new Promise((resolve, reject) => {
            db.query(dailyExpensesQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const todayCashTotal = dailySalesResult[0]?.dailySalesTotal || 0;
        const todayExpenses = dailyExpensesResult[0]?.dailyExpensesTotal || 0;

        // Calculate Closing Cash
        const closingCash = (openingCash - openingExpenses) + (todayCashTotal - todayExpenses);

        const invoicesQuery = `
            SELECT 
                inv.invoice_id, -- Invoice ID for reference
                inv.invoice_code,
                inv.total_amount AS billing, -- Total invoice amount
                IFNULL(SUM(CASE 
                    WHEN DATE(r.document_date) = ? THEN r.paid 
                    ELSE 0 END), 0) AS paid_today, -- Sum of today's payments
                inv.taxable_amount AS without_tax, -- Taxable amount
                inv.tax_amount AS tax, -- Tax amount
                inv.document_date AS invoice_date, -- Invoice document date
                MAX(r.document_date) AS last_receipt_date, -- Latest receipt date (regardless of date)
                (
                    SELECT IFNULL(SUM(inner_r.paid), 0)
                    FROM receipts inner_r
                    WHERE inner_r.invoice_id = inv.invoice_id
                    AND inner_r.status = 'final'
                    AND DATE(inner_r.document_date) <= ?
                ) AS total_paid, -- Total paid (across all days)
                ic.client_name
            FROM invoices inv
            LEFT JOIN receipts r 
                ON inv.invoice_id = r.invoice_id 
                AND r.status = 'final'
            LEFT JOIN invoiceclients ic 
                ON inv.invoice_id = ic.invoice_id -- Join with invoiceclients table
            WHERE inv.company_id = ?
            AND (DATE(inv.document_date) = ? -- Invoices created today
                OR DATE(r.document_date) = '${formattedDate}') -- Invoices with payments today
            AND inv.status = 'final'
            AND inv.document_type NOT IN ('Proforma', 'Credit-Note')
            GROUP BY inv.invoice_id
            HAVING paid_today > 0 OR DATE(inv.document_date) = '${formattedDate}' -- Ensure either paid today or created today
            ORDER BY 
                IF(MAX(r.document_date) IS NOT NULL, MAX(r.document_date), inv.document_date) DESC;
        `;

        const invoicesResults = await new Promise((resolve, reject) => {
            db.query(invoicesQuery, [formattedDate, formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const expensesQuery = `
            SELECT 
                e.obs, -- Expense obs
                e.expense_code, -- Expense code
                e.amount AS expense_amount, -- Amount of the expense
                e.document_date AS expense_date, -- Expense document date
                e.payment_method, -- Payment method used
                e.description -- Description of the expense
            FROM expenses e
            WHERE e.company_id = ?
            AND DATE(e.document_date) = ? -- Expenses for the specific date
            AND e.status = 'final'
            ORDER BY e.document_date DESC;
        `;

        const expensesResults = await new Promise((resolve, reject) => {
            db.query(expensesQuery, [companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Send the response
        res.json({
            openingCash: openingCash - openingExpenses,
            todayCashTotal: todayCashTotal - todayExpenses,
            closingCash: closingCash,
            dailySalesTotal: todayCashTotal,
            invoices: invoicesResults,
            expenses: todayExpenses,
            theExpenses: expensesResults,
        });
    } catch (error) {
        console.error('Error fetching daily sales report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getDailyBalancesByPaymentMethod = async (req, res) => {
    const { date } = req.query; // Expected in 'YYYY-MM-DD' format
    const { companyId } = req;

    try {
        const formattedDate = new Date(date).toISOString().slice(0, 10);

        // Query for opening balances per payment method from receipts
        const openingReceiptsQuery = `
            SELECT 
                r.payment_method,
                COALESCE(SUM(CASE 
                    WHEN DATE(r.document_date) < ? THEN r.paid 
                    ELSE 0 END), 0) AS openingCash
            FROM receipts r
            JOIN invoices i ON r.invoice_id = i.invoice_id AND r.status = 'final'
            WHERE i.company_id = ?
            AND DATE(r.document_date) < ?
            AND i.status = 'final'
            AND i.document_type NOT IN ('Proforma', 'Credit-Note')
            GROUP BY r.payment_method;
        `;

        const openingReceiptsResult = await new Promise((resolve, reject) => {
            db.query(openingReceiptsQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Query for opening expenses per payment method
        const openingExpensesQuery = `
            SELECT 
                e.payment_method,
                COALESCE(SUM(CASE 
                    WHEN DATE(e.document_date) < ? THEN e.amount 
                    ELSE 0 END), 0) AS openingExpenses
            FROM expenses e
            WHERE e.company_id = ?
            AND DATE(e.document_date) < ?
            AND e.status = 'final'
            GROUP BY e.payment_method;
        `;

        const openingExpensesResult = await new Promise((resolve, reject) => {
            db.query(openingExpensesQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Query for today’s sales per payment method
        const todayReceiptsQuery = `
            SELECT 
                r.payment_method,
                COALESCE(SUM(CASE 
                    WHEN DATE(r.document_date) = ? THEN r.paid 
                    ELSE 0 END), 0) AS todayCashTotal
            FROM receipts r
            JOIN invoices i ON r.invoice_id = i.invoice_id AND r.status = 'final'
            WHERE i.company_id = ?
            AND DATE(r.document_date) = ?
            AND i.status = 'final'
            AND i.document_type NOT IN ('Proforma', 'Credit-Note')
            GROUP BY r.payment_method;
        `;

        const todayReceiptsResult = await new Promise((resolve, reject) => {
            db.query(todayReceiptsQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Query for today’s expenses per payment method
        const todayExpensesQuery = `
            SELECT 
                e.payment_method,
                COALESCE(SUM(CASE 
                    WHEN DATE(e.document_date) = ? THEN e.amount 
                    ELSE 0 END), 0) AS todayExpenses
            FROM expenses e
            WHERE e.company_id = ?
            AND DATE(e.document_date) = ?
            AND e.status = 'final'
            GROUP BY e.payment_method;
        `;

        const todayExpensesResult = await new Promise((resolve, reject) => {
            db.query(todayExpensesQuery, [formattedDate, companyId, formattedDate], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Process results into a format that groups by payment method and calculates balances
        const balancesByPaymentMethod = {};

        const populateBalances = (resultArray, key) => {
            resultArray.forEach(row => {
                const paymentMethod = row.payment_method || 'Unknown';
                if (!balancesByPaymentMethod[paymentMethod]) {
                    balancesByPaymentMethod[paymentMethod] = {
                        openingCash: 0,
                        todayCashTotal: 0,
                        closingCash: 0,
                        openingExpenses: 0,
                        todayExpenses: 0,
                    };
                }
                balancesByPaymentMethod[paymentMethod][key] = row[key];
            });
        };

        // Populate balances for each section
        populateBalances(openingReceiptsResult, 'openingCash');
        populateBalances(openingExpensesResult, 'openingExpenses');
        populateBalances(todayReceiptsResult, 'todayCashTotal');
        populateBalances(todayExpensesResult, 'todayExpenses');

        // Calculate closing balances for each payment method
        Object.keys(balancesByPaymentMethod).forEach(paymentMethod => {
            const { openingCash, openingExpenses, todayCashTotal, todayExpenses } = balancesByPaymentMethod[paymentMethod];
            balancesByPaymentMethod[paymentMethod].closingCash = (openingCash - openingExpenses) + (todayCashTotal - todayExpenses);
        });

        // Send the response
        res.json(balancesByPaymentMethod);
    } catch (error) {
        console.error('Error fetching daily balances by payment method:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
