const express = require('express');
const router = express.Router();
const db = require('./db');
const path = require('path');
const fs = require('fs/promises');
const puppeteer = require('puppeteer');
const authenticateUser = require('../middleware/authMiddleware');
const taxExemptionCodes = require('./taxExemptionCodes');

router.get('/invoice/:id/pdf', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req;

    // Temporary file path
    const tempFilePath = path.join(__dirname, 'temp', `invoice_${companyId}.pdf`);

    try {
        const invoiceData = await fetchInvoiceData(id, companyId);
        const html = await generateHTML(invoiceData);

        // Launch Puppeteer and generate PDF
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            },
            headerTemplate: `
                <div style="font-size: 8px; color: #808080; width: 100%; text-align: center; padding: 5px;">
                    <!-- Header content here (optional) -->
                </div>
            `,
            footerTemplate: `
                <!-- Footer -->
                <div style='margin: 0 15mm; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: .5px solid #ddd;'>
                    <div style="font-size: 11px; padding-top: 15px; ">
                        <h3 style="margin: 0;">${invoiceData.docCustomizations.footer || ''}</h3>
                        <p style="color: #999999; margin: 0;">Processed by validated program no. 144/AGT/2019 | Fanito</p>
                        ${(invoiceData.invoice.status !== 'final' || invoiceData.invoice.document_type === 'Proforma') ? 
                            `<p style="color: #999999; margin: 0;">This document does not serve as an invoice</p>` : ''}
                    </div>
                    <div style="font-size: 11px; color: #808080; text-align: end; padding-top: 15px;">
                        <span style="float: right;">Page <span class="pageNumber"></span> de <span class="totalPages"></span></span>
                    </div>
                </div>
            `
        });
        await browser.close();

        // Write the PDF to a temporary file
        await fs.writeFile(tempFilePath, pdfBuffer);

        // Set headers and send PDF file
        res.setHeader('Content-Disposition', `attachment; filename="invoice_${id}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(tempFilePath, err => {
            if (err) {
                console.error('Error sending PDF:', err.message);
                res.status(500).json({ message: 'Server error', error: err.message });
            } else {
                // Delete the file after it's sent
                fs.unlink(tempFilePath).catch(err => console.error('Error deleting temp file:', err.message));
            }
        });
    } catch (err) {
        console.error('Error generating PDF:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


async function generateHTML(invoiceData) {
    const { invoice, items, companyDetails, docCustomizations, cancellationReason, bankAccounts, tax,
        totalWithTax,
        discount,
        withoutTax,
        formattedTotalsArray, exemptionReason } = invoiceData;

    // Paths to the fonts
    const fontPath = path.resolve(__dirname, '..', 'uploads', 'font');

    // List of font files and corresponding styles and weights
    const fontFiles = [
        { file: 'Roboto-Black.ttf', weight: 900, style: 'normal' },
        { file: 'Roboto-BlackItalic.ttf', weight: 900, style: 'italic' },
        { file: 'Roboto-Bold.ttf', weight: 700, style: 'normal' },
        { file: 'Roboto-BoldItalic.ttf', weight: 700, style: 'italic' },
        { file: 'Roboto-Italic.ttf', weight: 400, style: 'italic' },
        { file: 'Roboto-Light.ttf', weight: 300, style: 'normal' },
        { file: 'Roboto-LightItalic.ttf', weight: 300, style: 'italic' },
        { file: 'Roboto-Medium.ttf', weight: 500, style: 'normal' },
        { file: 'Roboto-MediumItalic.ttf', weight: 500, style: 'italic' },
        { file: 'Roboto-Regular.ttf', weight: 400, style: 'normal' },
        { file: 'Roboto-Thin.ttf', weight: 100, style: 'normal' },
        { file: 'Roboto-ThinItalic.ttf', weight: 100, style: 'italic' },
    ];

    // Assuming docCustomizations.logoUrl contains the file path or name
    const logoPath = path.resolve(__dirname, '..', 'uploads', path.basename(docCustomizations.logoUrl));

    try {
        // Load the font files and convert to base64
        const fontFaces = await Promise.all(
            fontFiles.map(async ({ file, weight, style }) => {
                const fontFilePath = path.join(fontPath, file);
                const fontBytes = await fs.readFile(fontFilePath);
                const fontBase64 = fontBytes.toString('base64');
                const fontDataUri = `data:font/ttf;base64,${fontBase64}`;
                return `
                    @font-face {
                        font-family: 'Roboto';
                        src: url(${fontDataUri}) format('truetype');
                        font-weight: ${weight};
                        font-style: ${style};
                    }
                `;
            })
        );

        // Join all the font-face rules
        const fontFaceStyles = fontFaces.join('\n');

        // Read image from local file system
        const logoImageBytes = await fs.readFile(logoPath);
        
        // Convert image to base64
        const logoBase64 = logoImageBytes.toString('base64');
        
        // Determine the image MIME type based on file extension
        let mimeType = 'image/jpeg';  // Default to JPEG
        if (docCustomizations.logoUrl.endsWith('.png')) {
            mimeType = 'image/png';
        } else if (docCustomizations.logoUrl.endsWith('.jpg') || docCustomizations.logoUrl.endsWith('.jpeg')) {
            mimeType = 'image/jpeg';
        }
    
        // Create the base64 image string for embedding
        const logoDataUri = `data:${mimeType};base64,${logoBase64}`;

        const invotype = invoice.document_type === 'Proforma' ? 'Factura Proforma' : invoice.document_type === 'Invoice' ? 'Factura' : 'Factura/Recibo';

        // Generate HTML content
        return `
            <style>
                ${fontFaceStyles}
                body {
                    font-family: 'Roboto', sans-serif;
                    font-size: 12px;
                    background-color: white;
                }
                h3 {
                    font-family: 'Roboto', sans-serif;
                    font-weight: 700;
                }
                strong {
                    font-family: 'Roboto', sans-serif;
                    font-weight: 700;
                }
                th{
                    font-family: 'Roboto', sans-serif;
                    font-weight: 900;
                }
                td{
                    font-family: 'Roboto', sans-serif;
                    font-weight: 400;
                }
            </style>
            <div
                style="
                    font-size: 12px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background-color: white; position: relative;
                "
            >
                <div style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 8rem; color: #fc8181; z-index: 0;'>
                    ${invoice.status === 'canceled' ? 'Canceled' : ``}
                </div>
                <!-- Main content -->
                <div style="flex-grow: 1; position: relative; z-index: 5;">
                    <!-- Header -->
                    <div style="margin-bottom: 30px;">
                        ${logoDataUri ? `<img src="${logoDataUri}" width="200" alt="Company Logo" />` : ''}
                    </div>

                    <!-- Details -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
                        <div style="max-width: 45%;">
                            <div>
                                <p style="margin: 0;"><strong style="font-weight: bold; font-size: 13px; margin: 0;">${companyDetails.companyName || ''}</strong></p>
                                ${companyDetails.address ? `<p style="margin: 0;">${companyDetails.address}</p>` : ''}
                                ${companyDetails.phone  ? `<p style="margin: 0;"><span style="font-weight: 700">Contact:</span> ${companyDetails.phone }</p>` : ''}
                                ${companyDetails.email ? `<p style="margin: 0;"><span style="font-weight: 700">Email:</span> ${companyDetails.email}</p>` : ''}
                                ${companyDetails.taxpayerNumber  ? `<p style="margin: 0;"><span style="font-weight: 700">Tax ID:</span> ${companyDetails.taxpayerNumber }</p>` : ''}
                            </div>
                        </div>
                        <div style="max-width: 45%;">
                            ${invoice.status !== 'draft' ? 
                                `<p style="margin: 0;"><strong style="font-size: 13px; font-weight: bold;">${invotype}: ${invoice.invoice_code}</strong></p>` : ''}
                            <p style="margin: 0;">Honorable Mr.(s),</p>
                            <p style="margin: 0;"><strong style="font-size: 13px; font-weight: bold;">${invoice.client_name || ''}</strong></p>
                            ${invoice.client_phone ? `<p style="margin: 0;">Contact: ${invoice.client_phone }</p>` : ''}
                            <p style="margin: 0;">${invoice.client_tax_id  ? `Tax ID: <span style="font-weight: bold;">${invoice.client_tax_id }</span>` : 'Final consumer'}</p>
                            ${invoice.client_city  ? `<p style="margin: 0;">${invoice.client_city }</p>` : ''}
                            ${invoice.client_address  ? `<p style="margin: 0;">${invoice.client_address }</p>` : ''}
                        </div>
                    </div>

                    ${invoice.status && 
                        `<div style="width: 40%; ${invoice.status !== 'draft' ?'font-weight: bold; border-bottom: 1px solid #000;':'border-bottom: 0px solid #000;'} padding: 5px 0;">
                            ${invoice.status !== 'draft' ? 'Original' : 'Draft Invoice'}
                        </div>`
                    }

                    ${invoice.document_type === 'Credit-Note'
                        ?
                        `<div style="width: 100%; border-bottom: 1px solid #000; padding: 5px 0; margin-top: 6px;">
                            Credit Note No. ${invoice.invoice_code} (Cancellation - Reference Invoice: ${invoice.refcode})
                        </div>`
                        :``
                    }

                    <!-- Date and Due Date -->
                    <div style="display: flex; gap: 5%; margin-top: 15px; font-size: 11px; color: #000;">
                        <div style="width: 20%;">
                            <div style="font-weight: bold; font-size: 12px; display: flex; gap: 2px; border-bottom: 1px solid #000;">
                                <div style="flex: 1; padding: 5px 0;">Date</div>
                            </div>
                            <div style="margin-bottom: 2px;">
                                <div style="display: flex; flex-direction: row; gap: 2px; padding: 0; border-radius: 4px;">
                                    <div style="flex: 1; padding: 5px 0;">${formatDate(invoice.document_date)}</div>
                                </div>
                            </div>
                        </div>
                        <div style="width: 25%;">
                            <div style="font-weight: bold; font-size: 12px; display: flex; gap: 2px; border-bottom: 1px solid #000;">
                                <div style="flex: 1; padding: 5px 0;">Due Date</div>
                            </div>
                            <div style="margin-bottom: 2px;">
                                <div style="display: flex; flex-direction: row; gap: 2px; padding: 0; border-radius: 4px;">
                                    <div style="flex: 1; padding: 5px 0;">${formatDate(calculateNewDate(invoice.document_date, invoice.due_date))}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Item Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; margin-top: 10px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #000;">
                                <th style="text-align: left; padding: 5px 0;">Code</th>
                                <th style="text-align: left; padding: 5px 5px;">Description</th>
                                <th style="text-align: right; padding: 5px 0;">Unit Price</th>
                                <th style="text-align: right; padding: 5px 5px;">Qty.</th>
                                <th style="text-align: right; padding: 5px 0;">Disc.</th>
                                <th style="text-align: right; padding: 5px 5px;">Tax/VAT</th>
                                <th style="text-align: right; padding: 5px 0;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr style="border-bottom: .5px solid #ddd;">
                                    <td style="padding: 5px 0;">${item.item_code  || ''}</td>
                                    <td style="padding: 5px 5px;">${item.description  || ''}</td>
                                    <td style="text-align: right; padding: 5px 0;">${setCurrencyFormat(item.unit_price)}</td>
                                    <td style="text-align: right; padding: 5px 5px;">${item.quantity}</td>
                                    <td style="text-align: right; padding: 5px 0;">${item.discount_amount || 0}%</td>
                                    <td style="text-align: right; padding: 5px 5px;">${item.tax_rate == 0 ?`<span style='font-size: 9; margin-right: 2px;'>${taxExemptionCodes.find(code => code.name === item.exemption_reason)?.code}</span>`: ''}${item.tax_rate.toFixed(2)}%</td>
                                    <td style="text-align: right; padding: 5px 0;">${setCurrencyFormat((((item.quantity*item.unit_price - (((parseFloat(item.discount_amount) || 0) / 100) * item.quantity*item.unit_price))) * (1 + item.tax_rate/100) ))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <!-- Summary -->
                    <div style="display: flex; justify-content: space-between; margin: 0;">
                        <div style="font-size: 11px; margin-top: 20px; width: 50%;">
                            <div style="font-weight: bold; font-size: 12px; display: flex; gap: 2px; border-bottom: 1px solid #000;">
                                <div style="flex: 1; padding: 5px 0;">Tax/VAT</div>
                                <div style="flex: 1; padding: 5px 0; text-align: center;">Incidence</div>
                                <div style="flex: 1; padding: 5px 0; text-align: right;">Amount</div>
                            </div>
                            ${formattedTotalsArray && formattedTotalsArray.map(item => `
                                <div style="display: flex; gap: 2px; padding: 5px 0; color: #000;">
                                    <div style="flex: 1; font-weight: 400;">${item.taxRate}</div>
                                    <div style="flex: 1; text-align: center; font-weight: 400;">${setCurrencyFormat(item.incidence)}</div>
                                    <div style="flex: 1; text-align: right; font-weight: 400;">${setCurrencyFormat(item.taxAmount)}</div>
                                </div>
                            `).join('')}
                        </div>
                        <table style="margin-top: 20px; width: 40%; border-collapse: collapse; font-size: 11px;">
                            <thead>
                                <tr style="border-bottom: 1px solid #000;">
                                    <th style="font-weight: bold; font-size: 12px; padding: 5px 0; text-align: left">Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="">
                                    <td style="padding: 5px 0;">Gross Total:</td>
                                    <td style="text-align: right; padding: 5px 0;">${setCurrencyFormat(totalWithTax)}</td>
                                </tr>
                                <tr style="">
                                    <td style="padding: 5px 0;">Discount:</td>
                                    <td style="text-align: right; padding: 5px 0;">${setCurrencyFormat(discount || 0)}</td>
                                </tr>
                                <!--<tr style="">
                                    <td style="padding: 5px 0;">Retenção:</td>
                                    <td style="text-align: right; padding: 5px 0;">${setCurrencyFormat(0 || 0)}</td>
                                </tr>-->
                                <tr style="">
                                    <td style="padding: 5px 0;">Net Total:</td>
                                    <td style="text-align: right; padding: 5px 0;">${setCurrencyFormat(withoutTax || 0)}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 5px 0;">Tax/VAT:</td>
                                    <td style="text-align: right; padding: 5px 0;">${setCurrencyFormat(tax || 0)}</td>
                                </tr>
                                <tr style="font-weight: bold; font-size: 12;">
                                    <td style="font-weight: bold;">Total:</td>
                                    <td style="font-weight: bold; text-align: right; padding: 5px 0;">${setCurrencyFormat(withoutTax + tax)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    ${cancellationReason ?
                        `<div style="font-size: 11px; margin-top: 20px; width: 50%; margin: 0;">
                            <div style="font-weight: bold; font-size: 12px; display: flex; gap: 2px; border-bottom: 1px solid #000;">
                                <strong style="flex: 1; padding: 5px 0;">Cancellation reason</strong>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 2px; padding: 5px 0;">
                                <div style="display: flex; justify-content: space-between; gap: 2px;">
                                    <div style='font-weight: 400;'>${cancellationReason.cancellation_reason}</div>
                                </div>
                            </div>
                        </div>`
                        :``
                    }

                    ${(exemptionReason.length > 0) ? 
                        `<div style="font-size: 11px; margin-top: 20px; width: 50%; margin: 0;">
                            <div style="font-weight: bold; font-size: 12px; display: flex; gap: 2px; border-bottom: 1px solid #000;">
                                <div style="flex: 1; padding: 5px 0;">Reason for exemption</div>
                            </div>
                            ${exemptionReason.map(reason => `
                                <div style="display: flex; gap: 2px; padding: 5px 0; color: #000;">
                                    <div style="flex: 1; font-weight: 400;">${reason.exemption_code} - ${reason.exemption_reason}</div>
                                </div>
                            `).join('')}
                        </div>`
                        :``
                    }

                    ${bankAccounts.length > 0 ?
                        `<div style="font-size: 11px; margin-top: 20px; width: 50%; margin: 0;">
                            <div style="font-weight: bold; font-size: 12px; display: flex; gap: 2px; border-bottom: 1px solid #000;">
                                <strong style="flex: 1; padding: 5px 0;">Bank Details</strong>
                            </div>
                            ${bankAccounts.map(item => `
                                <div style="display: flex; flex-direction: column; gap: 2px; padding: 5px 0;">
                                    <div style="display: flex; justify-content: space-between; gap: 2px;">
                                        <div style='font-weight: 400;'>${item.bankName}</div>
                                        <div style="text-align: right; font-weight: 400;">${item.accountNumber}</div>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; gap: 2px;">
                                        <div style='font-weight: 400;'>IBAN</div>
                                        <div style="text-align: right; font-weight: 400;">${item.iban}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>`
                        :``
                    }

                    ${invoice.document_type === 'Credit-Note'
                        ?
                        `<div style="width: 40%; border-top: 1px solid #000; padding: 5px 0; margin-top: 60px; font-size: 11px; text-align: center;">
                            Signature and stamp of the acquirer
                        </div>`
                        :``
                    }

                </div>
            </div>
        `;
    } catch (err) {
        console.error("Error loading logo image:", err);
    }
}

function setCurrencyFormat(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

async function fetchInvoiceData(invoiceId, companyId) {
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
            db.query(invoiceQuery, [companyId, invoiceId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Fetch invoice items
        const itemsQuery = `
            SELECT * FROM invoiceitems
            WHERE invoice_id = ?
        `;

        const items = await new Promise((resolve, reject) => {
            db.query(itemsQuery, [invoiceId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Fetch company details
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
            throw new Error('Company details not found');
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

        // Fetch the specific cancellation Reason
        const cancellationReasonQuery = `
            SELECT * 
            FROM cancellations
            WHERE doc_code = ? AND document_type = ? AND company_id = ?;
        `;

        const cancellationReason = await new Promise((resolve, reject) => {
            db.query(cancellationReasonQuery, [invoice.invoice_code, invoice.document_type, companyId], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]); // Expecting a single row for a specific receipt
            });
        });

        // Process invoice totals
        const totals = await calculateTotals(items);

        return {
            invoice,
            items,
            companyDetails,
            docCustomizations,
            bankAccounts,
            cancellationReason,
            ...totals
        };
    } catch (err) {
        console.error('Error fetching invoice data:', err);
        throw err;
    }
}

async function calculateTotals(items) {
    // Calculate totals as per your requirements
    let tax = 0
    const totalWithTax = items.reduce((total, item) => total + item.total_price, 0);
    let discount = 0
    let withoutTax = 0

    // New object to store the incidence and corresponding tax for each tax rate (Taxa14, Isento)
    const totalsArray = {};

    items.forEach(item => {
        const price = parseFloat(item.unit_price) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const itemTotal = price * quantity;
        
        const itemDiscount = ((parseFloat(item.discount_amount) || 0) / 100) * itemTotal;
        const itemTaxRate = parseFloat(item.tax_rate) || 0;
        const itemIncidence = itemTotal - itemDiscount;
        const itemTax = (itemTaxRate / 100) * itemIncidence;

        discount += itemDiscount;
        withoutTax += itemIncidence;
        tax += itemTax;

        // Identify the tax category (Taxa14, Isento) and accumulate the values
        const taxCategory = itemTaxRate > 0 ? `Taxa${itemTaxRate} (${itemTaxRate}%)` : `Isento (0%)`;

        if (!totalsArray[taxCategory]) {
            totalsArray[taxCategory] = {
                incidence: 0,
                taxAmount: 0
            };
        }

        totalsArray[taxCategory].incidence += itemIncidence;
        totalsArray[taxCategory].taxAmount += itemTax;
    });

    // Convert totalsArray into a proper array with formatted numbers (without currency symbols)
    const formattedTotalsArray = Object.keys(totalsArray).map(taxCategory => ({
        taxRate: taxCategory,
        incidence: totalsArray[taxCategory].incidence, // Incidência (total without tax)
        taxAmount: totalsArray[taxCategory].taxAmount // Valor (tax amount)
    }));

    const cart = items.map(item => ({
        tax_rate: item.tax_rate,
        exemption_reason: item.exemption_reason,
        exemption_code: taxExemptionCodes.find(code => code.name === item.exemption_reason)?.code,
    }));

    const exemptionReason = [];

    cart.forEach(item => {
        // Check if an item with the same exemption_reason and exemption_code already exists in the exemptionReason array
        const exists = exemptionReason.some(existingItem => 
            existingItem.exemption_reason === item.exemption_reason &&
            existingItem.exemption_code === item.exemption_code
        );

        // If it doesn't exist, add the item to the exemptionReason array
        if (!exists) {
            if(item.tax_rate == 0){
                exemptionReason.push({
                    exemption_reason: item.exemption_reason,
                    exemption_code: item.exemption_code
                });
            }
        }
    });

    return {
        tax,
        totalWithTax,
        discount,
        withoutTax,
        formattedTotalsArray,
        exemptionReason
    };
}

const formatDate = (dateString) => {
    try {
        // Parse the date string
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        // Define options for formatting the date
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        // Format the date to Portuguese locale as 'dd/mm/yyyy'
        const formatter = new Intl.DateTimeFormat('pt-PT', options);
        const formattedDate = formatter.format(date);

        // Log formatted date for debugging
        // console.log('Formatted Date:', formattedDate);

        // Replace month number with Portuguese format
        const monthsInPortuguese = {
            '01': 'Jan',
            '02': 'Fev',
            '03': 'Mar',
            '04': 'Abr',
            '05': 'Mai',
            '06': 'Jun',
            '07': 'Jul',
            '08': 'Ago',
            '09': 'Set',
            '10': 'Out',
            '11': 'Nov',
            '12': 'Dez'
        };

        // Split formatted date
        const [day, month, year] = formattedDate.split('/');

        // Log parts for debugging
        // console.log('Day:', day);
        // console.log('Month:', month);
        // console.log('Year:', year);

        // Get the Portuguese month abbreviation
        const formattedMonth = monthsInPortuguese[month] || month;

        // Return the formatted date
        return `${day} ${formattedMonth} ${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

const calculateNewDate = (dateString, paymentTerm) => {
    const date = new Date(dateString);

    switch (paymentTerm) {
        case 'Pronto Pagamento':
            return date.toISOString(); // No days added
        case '15 Dias':
            date.setDate(date.getDate() + 15);
            break;
        case '30 Dias':
            date.setDate(date.getDate() + 30);
            break;
        case '45 Dias':
            date.setDate(date.getDate() + 45);
            break;
        case '60 Dias':
            date.setDate(date.getDate() + 60);
            break;
        case '90 Dias':
            date.setDate(date.getDate() + 90);
            break;
        default:
            throw new Error('Invalid payment term');
    }

    return date.toISOString();
};

module.exports = router;