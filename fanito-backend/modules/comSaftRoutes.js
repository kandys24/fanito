const express = require('express');
const router = express.Router();
const db = require('./db');
const authenticateUser = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizationMiddleware');
const fs = require('fs');
const xmlbuilder = require('xmlbuilder');
const forge = require('node-forge'); // Ensure you have this package installed

router.get('/export-saftao-xml', authenticateUser, authorizeRoles('admin', 'collab'), async (req, res) => {
    const { companyId } = req;
    const { year, month } = req.query;

    try {
        const startDate = new Date(year, month - 1);
        const endDate = new Date();
        
        // Utility function to execute a query
        const executeQuery = (query, params) => {
            return new Promise((resolve, reject) => {
                db.query(query, params, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };

        // Fetch company details
        const companyQuery = 'SELECT * FROM company WHERE cid = ? LIMIT 1';
        const companyDetails = await executeQuery(companyQuery, [companyId]);

        if (!companyDetails.length) {
            return res.status(404).send('Company not found');
        }

        const emailid = companyDetails[0].cemail;

        // Fetch additional company details
        const companyDetailQuery = 'SELECT * FROM companyDetails WHERE cid = ? LIMIT 1';
        const companyResult = await executeQuery(companyDetailQuery, [companyId]);

        if (!companyResult.length) {
            return res.status(404).send('Company details not found');
        }

        // Fetch invoice data
        const invoiceQuery = `
            SELECT * FROM invoices 
            WHERE document_date >= ? AND document_date < ? 
            AND company_id = ?;
        `;
        const invoices = await executeQuery(invoiceQuery, [startDate, endDate, companyId]);

        if (!invoices.length) {
            return res.status(404).send('No invoices found for the specified date range');
        }

        // Fetch client data and invoice items
        const clientPromises = invoices.map(invoice => {
            const clientQuery = `
                SELECT * FROM invoiceclients 
                WHERE invoice_id = ?;
            `;
            return executeQuery(clientQuery, [invoice.invoice_id]);
        });
        const clientsData = await Promise.all(clientPromises);

        const itemPromises = invoices.map(invoice => {
            const itemsQuery = `
                SELECT * FROM invoiceitems 
                WHERE invoice_id = ?;
            `;
            return executeQuery(itemsQuery, [invoice.invoice_id]);
        });
        const itemsData = await Promise.all(itemPromises);

        // Format customers and products for XML
        const customersXMT = clientsData.flat().map((client) => ({
            CustomerID: client.client_id.toString(),
            AccountID: 'Desconhecido',
            CustomerTaxID: client.client_tax_id || '999999999',
            CompanyName: client.client_name,
            BillingAddress: {
                AddressDetail: 'Desconhecido',
                City: 'Desconhecido',
                Country: 'AO'
            },
            ShipToAddress: {
                AddressDetail: 'Desconhecido',
                City: 'Desconhecido',
                Province: 'Desconhecido',
                Country: 'AO'
            },
            SelfBillingIndicator: 0
        }));

        const products = itemsData.flat().map(item => ({
            ProductType: 'P',
            ProductCode: item.item_code,
            ProductDescription: item.description,
            ProductNumberCode: item.item_code
        }));

        const privateKeyPem = fs.readFileSync('key.pem', 'utf-8');

        const calculateHash = (invoice, previousHash) => {
            let hashString = previousHash === '' 
                ? `${invoice.document_date};${invoice.created_at};${invoice.invoice_code};${invoice.total_amount};`
                : `${invoice.document_date};${invoice.created_at};${invoice.invoice_code};${invoice.total_amount};${previousHash}`;
            
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
            const md = forge.md.sha1.create();
            md.update(hashString, 'utf8');
            const signature = privateKey.sign(md);
            return forge.util.encode64(signature);
        };

        let previousHash = '';
        const invoicesData = invoices.map((invoice, index) => {
            const lines = itemsData[index].map(item => ({
                LineNumber: (item.item_id).toString(),
                ProductCode: item.item_code,
                ProductDescription: item.description,
                Quantity: `${item.quantity}`,
                UnitOfMeasure: 'Unidade',
                UnitPrice: item.unit_price.toFixed(2),
                TaxPointDate: invoice.document_date.toISOString().split("T")[0],
                Description: item.description,
                CreditAmount: (parseFloat(item.unit_price) * parseFloat(item.quantity)).toFixed(2),
                Tax: {
                    TaxType: 'IVA',
                    TaxCountryRegion: 'AO',
                    TaxCode: 'ISE',
                    TaxPercentage: '0.0000'
                },
                TaxExemptionReason: 'Isento nos termos da alínea b) do nº1 do artigo 12.º do CIVA',
                TaxExemptionCode: 'M11',
                SettlementAmount: 0
            }));

            const invoiceData = {
                InvoiceNo: invoice.invoice_code,
                DocumentStatus: {
                    InvoiceStatus: invoice.status,
                    InvoiceStatusDate: invoice.document_date.toISOString().slice(0, 19),
                    SourceID: emailid,
                    SourceBilling: 'P'
                },
                Hash: '',
                HashControl: 1,
                Period: (new Date(invoice.document_date).getMonth() + 1).toString().padStart(2, '0'),
                InvoiceDate: invoice.document_date.toISOString().split("T")[0],
                InvoiceType: invoice.document_type,
                SpecialRegimes: {
                    SelfBillingIndicator: 0,
                    CashVATSchemeIndicator: 0,
                    ThirdPartiesBillingIndicator: 0
                },
                SourceID: emailid,
                SystemEntryDate: invoice.created_at.toISOString().slice(0, 19),
                CustomerID: invoice.client_id.toString(),
                ShipTo: {
                    Address: {
                        BuildingNumber: 'Luanda',
                        StreetName: 'Luanda',
                        AddressDetail: 'Luanda',
                        City: 'Luanda',
                        Province: 'Luanda',
                        Country: 'AO'
                    }
                },
                Line: lines,
                DocumentTotals: {
                    TaxPayable: parseFloat(0).toFixed(2),
                    NetTotal: lines.reduce((total, line) => total + parseFloat(line.CreditAmount), 0).toFixed(2),
                    GrossTotal: lines.reduce((total, line) => total + parseFloat(line.CreditAmount), 0).toFixed(2)
                }
            };

            invoiceData.Hash = calculateHash(invoiceData, previousHash);
            previousHash = invoiceData.Hash;

            return invoiceData;
        });

        const totalCredit = invoicesData.reduce((total, invoice) => {
            return total + parseFloat(invoice.DocumentTotals.NetTotal);
        }, 0).toFixed(2);

        const root = xmlbuilder.create({
            AuditFile: {
                '@xmlns': 'urn:OECD:StandardAuditFile-Tax:AO_1.01_01',
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                Header: {
                    AuditFileVersion: '1.01_01',
                    CompanyID: companyResult.taxpayerNumber,
                    TaxRegistrationNumber: companyResult.taxpayerNumber,
                    TaxAccountingBasis: 'F',
                    CompanyName: companyResult.companyName,
                    BusinessName: 'Farmácia',
                    CompanyAddress: {
                        AddressDetail: companyResult.address,
                        City: companyResult.city,
                        Country: 'AO'
                    },
                    FiscalYear: year,
                    StartDate: startDate.toISOString().split("T")[0],
                    EndDate: endDate.toISOString().split("T")[0],
                    CurrencyCode: 'AOA',
                    DateCreated: new Date().toISOString().split("T")[0],
                    TaxEntity: 'Global',
                    ProductCompanyTaxID: '5417141828',
                    SoftwareValidationNumber: '480/AGT/2024',
                    ProductID: 'Pharm App/SOFTWISE INVESTIMENT - PRESTAÇAO DE SERVIÇOS, LDA',
                    ProductVersion: 'Ver.1.0.1',
                    HeaderComment: 'Aplicação de Facturação',
                    Telephone: companyResult.phone,
                    Fax: companyResult.fax || '0',
                    Email: emailid
                },
                MasterFiles: {
                    Customer: customersXMT,
                    Product: products
                },
                SourceDocuments: {
                    SalesInvoices: {
                        NumberOfEntries: invoicesData.length.toString(),
                        TotalDebit: 0,
                        TotalCredit: totalCredit,
                        Invoice: invoicesData
                    },
                    Payments: {
                        NumberOfEntries: 0,
                        TotalDebit: 0,
                        TotalCredit: totalCredit
                    }
                },
            }
        });

        const xmlString = root.end({ pretty: true });

        const filename = `saft-ao-${new Date().toISOString().split('T')[0]}.xml`;
        res.header('Content-Type', 'application/xml');
        res.attachment(filename);
        res.send(xmlString);

    } catch (err) {
        console.error('Error generating XML:', err);
        res.status(500).send('Error generating XML');
    }
});



module.exports = router;