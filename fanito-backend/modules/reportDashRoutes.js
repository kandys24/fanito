const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');


// API Route to get monthly sales data for 'final' invoices for the current year of a specific company
router.get('/sales-data', authenticateUser, authorizeRoles('admin', 'collab'), (req, res) => {
    const { companyId } = req;

    const query = `
        SELECT 
            MONTHNAME(document_date) AS month, 
            SUM(total_amount) AS total_sales 
        FROM invoices 
        WHERE status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note'
        AND company_id = ?
        AND YEAR(document_date) = YEAR(CURDATE())
        GROUP BY month
        ORDER BY MONTH(document_date);
    `;

    db.query(query, [companyId], (err, results) => {
        if (err) {
            console.error('Error retrieving sales data:', err);
            return res.status(500).json({ error: 'Failed to fetch sales data' });
        }

        // Prepare the data in a format that the chart can use
        const labels = [];
        const data = [];
        
        results.forEach((row) => {
            labels.push(row.month);       // Month names
            data.push(row.total_sales);   // Sales for each month
        });

        res.json({
            labels,
            data,
        });
    });
});

// API Route get the top 3 items by total yearly sales
router.get('/top-sales', authenticateUser, (req, res) => {
    const { companyId } = req;

    // SQL query to get the top 3 items by total yearly sales
    const query = `
        SELECT 
            ii.description AS item_name, 
            DATE_FORMAT(i.document_date, '%Y-%m') AS month_year,
            SUM(ii.total_price) AS total_sales
        FROM invoiceitems ii
        INNER JOIN invoices i ON ii.invoice_id = i.invoice_id
        WHERE i.status = 'final' AND i.document_type != 'Proforma' AND i.document_type != 'Credit-Note'
        AND i.company_id = ?
        AND YEAR(i.document_date) = YEAR(CURDATE())
        GROUP BY ii.description, month_year
        ORDER BY ii.description, month_year;
    `;

    db.query(query, [companyId], (err, results) => {
        if (err) {
            console.error('Error retrieving top sales data:', err);
            return res.status(500).json({ error: 'Failed to fetch top sales data' });
        }

        // Process the results to create dynamic labels and datasets
        const itemData = {};
        const allLabels = new Set();

        results.forEach(row => {
            allLabels.add(row.month_year);
            if (!itemData[row.item_name]) {
                itemData[row.item_name] = {};
            }
            itemData[row.item_name][row.month_year] = row.total_sales;
        });

        // Sum total yearly sales per item to find the top 3 items
        const totalSalesPerItem = Object.keys(itemData).map(item_name => {
            const totalSales = Object.values(itemData[item_name]).reduce((sum, sales) => sum + sales, 0);
            return { item_name, totalSales };
        });

        // Sort by total sales and take the top 3 items
        const topItems = totalSalesPerItem
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 3)
            .map(item => item.item_name);

        // Convert Set to Array and sort labels
        const labels = Array.from(allLabels).sort();

        // console.log(labels);

        // Initialize datasets only for the top 3 items
        const datasets = topItems.map((item_name, index) => {
            const data = labels.map(label => itemData[item_name][label] || 0);
            return {
                label: item_name,
                data,
                fill: true,
                tension: 0.3,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;

                    if (!chartArea) return null;

                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, `rgba(${index * 100}, ${index * 50}, 200, 0.7)`);
                    gradient.addColorStop(1, `rgba(${index * 100}, ${index * 50}, 200, 0.1)`);
                    return gradient;
                },
                borderColor: `rgba(${index * 100}, ${index * 50}, 200, 1)`,
                borderWidth: 2,
                pointRadius: 1,
            };
        });

        res.json({
            labels,
            datasets,
        });
    });
});

// API Route to get top 5 final invoices
router.get('/top-invoices', authenticateUser, (req, res) => {
    const { companyId } = req;

    const query = `
        SELECT 
            inv.total_amount AS billing,
            IFNULL(SUM(rec.paid), 0) AS paid, -- Sum of paid amounts from receipts
            inv.taxable_amount AS without_tax,
            inv.tax_amount AS tax,
            inv.document_date AS date,
            MAX(rec.document_date) AS receipt_date -- Latest receipt date
        FROM invoices inv
        LEFT JOIN receipts rec ON inv.invoice_id = rec.invoice_id
        WHERE inv.status = 'final'
        AND inv.company_id = ?
        GROUP BY inv.invoice_id
        ORDER BY 
            IF(MAX(rec.document_date) IS NOT NULL, MAX(rec.document_date), inv.document_date) DESC
        LIMIT 5;
    `

    db.query(query, [companyId], (err, results) => {
        if (err) {
            console.error('Error retrieving top invoices:', err);
            return res.status(500).json({ error: 'Failed to fetch top invoices' });
        }

        // Return the top 5 invoices as a JSON response
        res.json(results);
    });
});

// API Route to get top clients who have purchased the most in 'final' invoices for the current year of a specific company
router.get('/top-clients', authenticateUser, (req, res) => {
    const { companyId } = req;

    // SQL query to get the top clients by total sales in 'final' invoices
    const query = `
        SELECT 
            ic.client_name AS client,
            SUM(i.total_amount) AS total_sales
        FROM invoiceclients ic
        INNER JOIN invoices i ON ic.invoice_id = i.invoice_id
        WHERE i.status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note'
        AND i.company_id = ?
        AND YEAR(i.document_date) = YEAR(CURDATE())
        GROUP BY ic.client_name
        ORDER BY total_sales DESC
        LIMIT 5;
    `;

    db.query(query, [companyId], (err, results) => {
        if (err) {
            console.error('Error retrieving top clients data:', err);
            return res.status(500).json({ error: 'Failed to fetch top clients data' });
        }

        // Process the results to get labels (client names) and data (total sales)
        const labels = [];
        const data = [];
        
        results.forEach((row) => {
            labels.push(row.client);      // Client names
            data.push(row.total_sales);   // Sales for each client
        });

        res.json({
            labels,
            data,
        });
    });
});

// API Route to get total sales amount for the current year for the authenticated user's company
router.get('/total-sales', authenticateUser, (req, res) => {
    const { companyId } = req;

    // SQL query to sum the total amount of 'final' invoices for the current year
    const query = `
        SELECT 
            SUM(total_amount) AS total_sales
        FROM invoices 
        WHERE status = 'final' AND document_type != 'Proforma' AND document_type != 'Credit-Note'
        AND company_id = ?
        AND YEAR(document_date) = YEAR(CURDATE());
    `;

    db.query(query, [companyId], (err, results) => {
        if (err) {
            console.error('Error retrieving total sales data:', err);
            return res.status(500).json({ error: 'Failed to fetch total sales data' });
        }

        // If no result, total_sales will be null, so we default it to 0
        const totalSales = results[0]?.total_sales || 0;

        res.json({ total_sales: totalSales });
    });
});

module.exports = router;