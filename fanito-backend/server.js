const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const usersRoutes = require('./modules/usersRoutes');
const companyRoutes = require('./modules/companyRoutes');
const docCustomRoutes = require('./modules/docCustomRoutes');
const taxesRoutes = require('./modules/taxesRoutes');
const myseriesRoutes = require('./modules/myseriesRoutes');
const accountPlansRoutes = require('./modules/accountPlansRoutes');
const comItemsRoutes = require('./modules/comItemsRoutes');
const pordefinirRoutes = require('./modules/pordefinirRoutes');
const clientDataRoutes = require('./modules/clientDataRoutes');
const invoicesRoutes = require('./modules/invoicesRoutes');
const invoicePDFRoutes = require('./modules/invoicePDFRoutes');
const reportDashRoutes = require('./modules/reportDashRoutes');
const comReportRoutes = require('./modules/comReportRoutes');
const comReceiptRoutes = require('./modules/comReceiptRoutes');
const cancellationsRoutes = require('./modules/cancellationsRoutes');
const receiptPDFRoutes = require('./modules/receiptPDFRoutes');
const comExpensesRoute = require('./modules/comExpensesRoute');
const comSaftRoutes = require('./modules/comSaftRoutes');

const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

dotenv.config();

const app = express();
// app.use(cors());

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.header('Origin'));
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});
  

const allowedOrigins = ['https://fanito.netlify.app', 'https://fanito-production.up.railway.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.options('*', cors()); // Enable preflight across all routes


app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

//module for users
app.use('/users', usersRoutes);

//module for company
app.use('/company', companyRoutes);

//module for company doccustom
app.use('/doccustom', docCustomRoutes);

//module for company taxes
app.use('/taxes', taxesRoutes);

//module for company myseriesRoutes
app.use('/series', myseriesRoutes);

//module for company myseriesRoutes
app.use('/accountplan', accountPlansRoutes);

//module for company comitems
app.use('/comitems', comItemsRoutes);

//module for company comitems
app.use('/comclient', clientDataRoutes);

//module for company pordefinir
app.use('/pordefinir', pordefinirRoutes);

//module for company invoicesRoutes
app.use('/invoices', invoicesRoutes)

//module for company invoicePDFRoutes
app.use('/invoicespdf', invoicePDFRoutes)

//module for company reportDashRoutes
app.use('/reportdash', reportDashRoutes);

// module for company comReportRoutes
app.use('/comreport', comReportRoutes);

// module for company comReceiptRoutes
app.use('/comreceipt', comReceiptRoutes);

// module for company comReceiptRoutes
app.use('/receiptpdf', receiptPDFRoutes);

// module for doc cancellationsRoutes
app.use('/cncell', cancellationsRoutes);

// module for expenses
app.use('/expenses', comExpensesRoute);

// module for saft
app.use('/saft', comSaftRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));