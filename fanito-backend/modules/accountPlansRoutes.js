const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

// Route to set or update account plan for a company
router.post('/set-account-plan', authenticateUser, authorizeRoles('admin'), async (req, res) => {
    const { companyId } = req;
    const { planName, planCost, billingPeriod, startDate, endDate, documentLimit, userLimit } = req.body;

    try {
        // Insert or update the account plan for the company
        const query = `
            INSERT INTO accountPlans (cid, plan_name, plan_cost, billing_period, start_date, end_date, document_limit, user_limit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                plan_name = VALUES(plan_name),
                plan_cost = VALUES(plan_cost),
                billing_period = VALUES(billing_period),
                start_date = VALUES(start_date),
                end_date = VALUES(end_date),
                document_limit = VALUES(document_limit),
                user_limit = VALUES(user_limit)
        `;

        await new Promise((resolve, reject) => {
            db.query(query, [companyId, planName, planCost, billingPeriod, startDate, endDate, documentLimit, userLimit], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        res.status(200).json({ message: 'Account plan set successfully' });

    } catch (err) {
        console.error('Error setting account plan:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/ge-taccount-plan', authenticateUser, async (req, res) => {
    const companyId = req.companyId; // Get company ID from the authenticated user

    try {
        const query = `
            SELECT 
                ap.plan_name AS plan, 
                ap.start_date AS balancePeriodStart, 
                ap.end_date AS balancePeriodEnd,
                ap.plan_cost As planprice,
                ap.document_count,
                ap.document_limit AS max_documents,
                COUNT(u.uid) AS users_count,
                ap.user_limit AS max_users
            FROM accountPlans ap
            LEFT JOIN users u ON u.cid = ap.cid
            WHERE ap.cid = ?
            GROUP BY ap.plan_name, ap.start_date, ap.end_date, ap.document_count, ap.document_limit, ap.user_limit
        `;

        const [result] = await new Promise((resolve, reject) => {
            db.query(query, [companyId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (result) {
            const accountInfo = {
                plan: result.plan,
                balancePeriod: `${formatDate(result.balancePeriodStart)} a ${formatDate(result.balancePeriodEnd)}`,
                planDetails: {
                    name: result.plan,
                    price: `${setCurrencyFormat(result.planprice)} / trimestre`, // This should come from your plan pricing info
                    remainingDays: `${calculateRemainingDays(result.balancePeriodEnd)} dia(s)`,
                    expiryDate: formatDate(result.balancePeriodEnd),
                },
                usage: {
                    documents: `${result.document_count} / ${result.max_documents}`,
                    users: `${result.users_count} / ${result.max_users}`,
                }
            };

            res.json(accountInfo);
        } else {
            res.json({ error: 'Account not found' });
        }

    } catch (err) {
        console.error('Error fetching account details:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

const calculateRemainingDays = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry - today;
    const daysRemaining = Math.ceil(difference / (1000 * 60 * 60 * 24));
    return daysRemaining;
};

function formatDate(date) {
    const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    };
    
    // Create a formatter for Portuguese (Brazil)
    const formatter = new Intl.DateTimeFormat('pt', options);
    return formatter.format(date);
}

const setCurrencyFormat = (amount) => {
    const pamount = amount;
    const numberOfDecimals = 2; 
    const formattedValue = pamount.toLocaleString("pt-ao", {
        style: "currency",
        currency: "AOA",
        minimumFractionDigits: numberOfDecimals,
        maximumFractionDigits: numberOfDecimals,
    });

    return formattedValue;
};

// Route to get the account plan details for a company
router.get('/get-account-plan', authenticateUser, async (req, res) => {
    const { companyId } = req;

    try {
        const accountPlan = await new Promise((resolve, reject) => {
            db.query(
                `SELECT plan_name AS plan, plan_cost, billing_period, start_date, end_date, document_limit, document_count, user_limit, user_count 
                FROM accountPlans WHERE cid = ?`,
                [companyId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result[0]);
                }
            );
        });

        if (!accountPlan) {
            return res.status(404).json({ message: 'Account plan not found' });
        }

        const saldoDias = Math.ceil((new Date(accountPlan.end_date) - new Date()) / (1000 * 60 * 60 * 24));

        res.status(200).json({
            plan: accountPlan.plan,
            planCost: accountPlan.plan_cost,
            billingPeriod: accountPlan.billing_period,
            period: `${accountPlan.start_date} a ${accountPlan.end_date}`,
            expiresIn: accountPlan.end_date,
            saldoDias,
            documents: `${accountPlan.document_count} / ${accountPlan.document_limit}`,
            users: `${accountPlan.user_count} / ${accountPlan.user_limit}`
        });

    } catch (err) {
        console.error('Error fetching account plan:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/api/account/plan/add', async (req, res) => {
    const companyId = 1; // Assuming the company ID is retrieved from the authenticated user
    const planName = 'PLUS'; // The name of the plan
    const planCost = 22260.00; // Price for the trimester in Kz, stored as a DECIMAL
    const billingPeriod = 'quarterly'; // Billing period for the plan
    const documentLimit = 1710; // Max documents allowed in the plan
    const userLimit = 8; // Max users allowed in the plan

    // Calculate the start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3); // Set end date to 3 months from start

    try {
        // Insert the new plan into the database
        const query = `
            INSERT INTO accountPlans (cid, plan_name, plan_cost, billing_period, start_date, end_date, document_limit, user_limit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await new Promise((resolve, reject) => {
            db.query(query, [
                companyId, 
                planName, 
                planCost, 
                billingPeriod, 
                startDate, 
                endDate, 
                documentLimit, 
                userLimit
            ], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Send the HTML response with <h1> tags
        res.status(201).send(`
            <h1>Plan added successfully</h1>
            <h1>Plan Name: ${planName}</h1>
            <h1>Plan Cost: ${planCost.toFixed(2)} Kz</h1>
            <h1>Billing Period: ${billingPeriod}</h1>
            <h1>Start Date: ${startDate.toDateString()}</h1>
            <h1>End Date: ${endDate.toDateString()}</h1>
            <h1>Document Limit: ${documentLimit}</h1>
            <h1>User Limit: ${userLimit}</h1>
        `);
    } catch (err) {
        console.error('Error adding new plan:', err);
        res.status(500).json({ error: 'Database error' });
    }
});



{/* ------------------------------------------------------------------------------------------------------------------------- */}

// const addPlanForCompany = async (companyId, planName, planCost, documentLimit, userLimit) => {
//     const billingPeriod = 'quarterly'; // Billing period for the plan

//     // Calculate the start and end dates
//     const startDate = new Date();
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + 3); // Set end date to 3 months from start

//     try {
//         // SQL query to insert a new plan into the accountPlans table
//         const query = `
//             INSERT INTO accountPlans (cid, plan_name, plan_cost, billing_period, start_date, end_date, document_limit, user_limit)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         // Execute the query using a promise
//         const result = await new Promise((resolve, reject) => {
//             db.query(query, [
//                 companyId, 
//                 planName, 
//                 planCost, 
//                 billingPeriod, 
//                 startDate, 
//                 endDate, 
//                 documentLimit, 
//                 userLimit
//             ], (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results);
//             });
//         });

//         // Return a success message with plan details
//         return {
//             status: 'success',
//             message: 'Plan added successfully',
//             data: {
//                 planName,
//                 planCost: planCost.toFixed(2) + ' Kz',
//                 billingPeriod,
//                 startDate: startDate.toDateString(),
//                 endDate: endDate.toDateString(),
//                 documentLimit,
//                 userLimit
//             }
//         };
//     } catch (err) {
//         console.error('Error adding new plan:', err);
//         return { status: 'error', message: 'Database error', error: err };
//     }
// };

// // Example usage:
// (async () => {
//     const response = await addPlanForCompany(1, 'PLUS', 22260.00, 1710, 8);
//     console.log(response);
// })();


module.exports = router;