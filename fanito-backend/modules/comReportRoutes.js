const express = require('express');
const router = express.Router();
const invoiceController = require('./controllers/invoiceController');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');

// Define the routes and associate them with controller methods, using authenticateUser
router.get('/tax-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getTaxReport);
router.get('/invoice-totals-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getInvoiceTotalsReport);
router.get('/totalpaid-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getTotalPaidReport);
router.get('/client-invoice-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getClientInvoiceReport);
router.get('/payment-method-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getPaymentMethodReport);
router.get('/invoice-status-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getInvoiceStatusReport);
// Route for financial summary report
router.get('/financial-summary-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getFinancialSummaryReport);
// Route for Daily Sales Report
router.get('/daily-sales-report', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getDailySalesReport);
router.get('/daily-sales-wallet', authenticateUser, authorizeRoles('admin', 'collab'), invoiceController.getDailyBalancesByPaymentMethod);

module.exports = router;