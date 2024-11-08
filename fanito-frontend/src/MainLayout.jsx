import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavBar from './components/Navbar/NavBar';
import Dashboard from './components/Dashboard/Dashboard';
import Invoices from './components/Invoices/Invoices';
import Proformas from './components/Proformas/Proformas';
import Contacts from './components/Contacts/Contacts';
import Items from './components/Items/Items';
import Reports from './components/Reports/Reports';
import NewInvoice from './components/Invoices/NewInvoice';
import NewProformas from './components/Proformas/NewProformas';
import NewDelivery from './components/Delivery/NewDelivery';
import NewClient from './components/Contacts/NewClient';
import NewItem from './components/Items/NewItem';
import NewInvoiceReceipt from './components/Invoices/NewInvoiceReceipt';
import NewDebitNote from './components/Invoices/NewDebitNote';
import NewSelfBilling from './components/Invoices/NewSelfBilling';
import ContactoDetails from './components/Contacts/ContactoDetails';
import ItemDetail from './components/Items/ItemDetail';
import Settings from './components/Settings/Settings';
import Account from './components/Settings/Account/Account';
import DocCustom from './components/Settings/DocCustom';
import TaxSettings from './components/Settings/TaxSettings';
import SerieSettings from './components/Settings/SerieSettings';
import AccountBilling from './components/Settings/Account/AccountBilling';
import Profile from './components/Settings/Account/Profile';
import ManageUsers from './components/Settings/Account/ManageUsers';
import EditItem from './components/Items/EditItem';
import EditClient from './components/Contacts/EditClient';
import RasInvoice from './components/Invoices/RasInvoice';
import TaxReport from './components/Reports/TaxReport';
import SalesReports from './components/Reports/SalesReports';
import ResProformas from './components/Proformas/ResProformas';
import RasReceipt from './components/Invoices/RasReceipt';
import CloneInvoice from './components/Invoices/CloneInvoice';
import CreditNote from './components/Invoices/CreditNote';
import TotalPaidReport from './components/Reports/TotalPaidReport';
import ClientInvoiceReport from './components/Reports/ClientInvoiceReport';
import ExportSaft from './components/Saftao/ExportSaft';
import Expenses from './components/Expenses/Expenses';
import ExpenseDetail from './components/Expenses/ExpenseDetail';
import FinancialSummaryReport from './components/Reports/FinancialSummaryReport';
import DailySalesReport from './components/Reports/DailySalesReport';

const MainLayout = ({ toggleDarkMode, darkMode }) => {

    return (
        <div 
            className='min-h-screen'
            style={{ padding: '15px 10%' }}
        >
            <NavBar
                toggleDarkMode={toggleDarkMode}
                darkMode={darkMode}
            />
            <>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/customization" element={<DocCustom />} />
                    <Route path="/settings/taxes" element={<TaxSettings />} />
                    <Route path="/settings/series" element={<SerieSettings />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/account/billing" element={<AccountBilling />} />
                    <Route path="/account/profile" element={<Profile />} />
                    <Route path="/account/users" element={<ManageUsers />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/new" element={<NewInvoice />} />
                    <Route path="/invoices/invoicereceipt/new" element={<NewInvoiceReceipt />} />
                    <Route path="/invoices/debitnote/new" element={<NewDebitNote />} />
                    <Route path="/invoices/selfbilling/new" element={<NewSelfBilling />} />
                    <Route path="/invoices/daft/:invoiceId/" element={<RasInvoice />} />
                    <Route path="/invoices/receipt/:invoiceId/:receiptId" element={<RasReceipt />} />
                    <Route path="/invoices/clone/:invoiceId/:typeofinvo" element={<CloneInvoice />} />
                    <Route path="/invoices/adjustment/:invoiceId/CreditNote" element={<CreditNote />} />
                    <Route path="/proformas" element={<Proformas />} />
                    <Route path="/proformas/new" element={<NewProformas />} />
                    <Route path="/proformas/daft/:invoiceId/" element={<ResProformas />} />
                    <Route path="/proformas/view/:invoiceId/" element={<ResProformas />} />
                    <Route path="/proformas/clone/:invoiceId/:typeofinvo" element={<CloneInvoice />} />
                    <Route path="/guia/new" element={<NewDelivery />} />
                    <Route path="/clients" element={<Contacts />} />
                    <Route path="/clients/new" element={<NewClient />} />
                    <Route path="/clients/details/:clientId" element={<ContactoDetails />} />
                    <Route path="/clients/edit/:clientId" element={<EditClient />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/expenses/details/:expenseId" element={<ExpenseDetail />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/items/new" element={<NewItem />} />
                    <Route path="/items/details/:itemId" element={<ItemDetail />} />
                    <Route path="/items/edit/:itemId" element={<EditItem />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/reports/tax" element={<TaxReport />} />
                    <Route path="/reports/sales" element={<SalesReports />} />
                    <Route path="/reports/totalpaid" element={<TotalPaidReport />} />
                    <Route path="/reports/client-invoice-report" element={<ClientInvoiceReport />} />
                    <Route path="/reports/summary-report" element={<FinancialSummaryReport />} />
                    <Route path="/reports/daily-sales-report" element={<DailySalesReport />} />
                    <Route path='/reports/saftao/export' element={<ExportSaft />} />
                    <Route path="*" element={<h1>Page not found...</h1>} />
                </Routes>
            </>
        </div>
    )
}

export default MainLayout;