import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import { BsPatchQuestionFill } from 'react-icons/bs';
import setCurrencyFormat from '../../constant/setCurrencyFormat';
import RightButton from '../Buttons/RightButton';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';

const DailySalesReport = () => {
    const [reportData, setReportData] = useState(null);
    const [balances, setBalances] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [date, setDate] = useState(''); // State to hold the date input

    const fetchDailySalesReport = async () => {
        if (!date) {
            setError('Please provide a date');
            return;
        }
        try {
            setLoading(true);
            const config = {
                ...getTokenConfig(),
                params: { date },
            };
            const response = await axios.get(`${API_URL}/comreport/daily-sales-report`, config);
            setReportData(response.data);
            fetchWallet();
            setLoading(false);
            setError(null); // Reset error state
        } catch (err) {
            setError('Failed to fetch daily sales report');
            setLoading(false);
        }
    };

    const fetchWallet = async () => {
        if (!date) {
            setError('Please provide a date');
            return;
        }

        try {
            setLoading(true);
            const config = {
                ...getTokenConfig(),
                params: { date },
            };
            const response = await axios.get(`${API_URL}/comreport/daily-sales-wallet`, config);
            setBalances(response.data);
            console.log(response.data);
            setLoading(false);
            setError(null); // Reset error state
        } catch (err) {
            setError('Failed to fetch daily sales wallet');
            setLoading(false);
        }
    };

    const splitText = (text) => {
        return text.split("").map((char, index) => (
            <span key={index} className="letter">
                {char}
            </span>
        ));
    };

    useGSAP(() => {
        gsap.fromTo(
            '.letter',
            {
                opacity: 0,
                y: 20,
            },
            {
                opacity: 1,
                y: 0,
                delay: 0.5,
                stagger: 0.05,
            }
        );
    }, []);

    const tableHStyle = "opacity-80 flex items-center cursor-pointer text-white";

    return (
        <main className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl">
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Daily Sales and Cash Flow Report")}</h1>
                </div>
                <div className="mt-5">
                    <div className="flex flex-col gap-4">
                        <div className='flex justify-between gap-4'>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)} // Set date state
                                className="border rounded-lg p-2 w-full  dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring focus:ring-blue-500"
                            />
                            <button
                                onClick={fetchDailySalesReport}
                                className="w-full text-sm py-5 px-10 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                                    bg-[#f1f1f1] dark:bg-black
                                    text-black dark:text-white 
                                    hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                                    active:scale-95 active:shadow-inner"
                            >
                                Fetch Report
                            </button>
                        </div>

                        {loading && <p className="text-blue-500 font-semibold">Loading...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && !error && reportData && (
                            <div id='dailySalesReport' className='flex flex-col gap-6 mt-5 bg-white py-5 px-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                                <div className="flex justify-around">
                                    <div className='flex flex-col items-center'>
                                        <h1 className={`text-2xl ${reportData.openingCash < 0 ? 'text-red-500' : 'text-green-600'} dark:${reportData.openingCash < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {setCurrencyFormat(reportData.openingCash)}
                                        </h1>
                                        <span className='text-sm'>Opening Balance</span>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <h1 className={`text-2xl ${reportData.todayCashTotal < 0 ? 'text-red-500' : 'text-blue-500'} dark:${reportData.todayCashTotal < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                            {setCurrencyFormat(reportData.todayCashTotal)}
                                        </h1>
                                        <span className='text-sm'>Today's Balance</span>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <h1 className={`text-2xl ${reportData.closingCash < 0 ? 'text-red-500' : 'text-green-600'} dark:${reportData.closingCash < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {setCurrencyFormat(reportData.closingCash)}
                                        </h1>
                                        <span className='text-sm'>Closing Balance</span>
                                    </div>
                                </div>

                                {/* Sales Breakdown */}
                                <div id='salesBreakdown' className='mt-5'>
                                    <h3 className="text-lg font-semibold text-center text-green-800 dark:text-green-400 mb-4">Sales Breakdown</h3>
                                    <div className="rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 border-b-0">
                                        <div className="category-details__header flex items-center bg-[#1E1E1E] dark:bg-[#080808] rounded px-3 py-2">
                                            <h3 className={`${tableHStyle} w-1/6`}>Code</h3>
                                            <h3 className={`${tableHStyle} w-1/3`}>Client Name</h3>
                                            <h3 className={`${tableHStyle} w-1/5`}>Pay Today</h3>
                                            <h3 className={`${tableHStyle} w-1/5`}>Total Paid</h3>
                                            <h3 className={`${tableHStyle} w-1/5`}>Charge</h3>
                                        </div>
                                        {reportData.invoices && reportData.invoices.length > 0 ? (
                                            reportData.invoices.map((sale, index) => (
                                                <div key={index} className={`flex justify-between px-3 py-3 my-1 rounded-md ${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <span className="w-1/6">{sale.invoice_code}</span>
                                                    <span className="w-1/3">{sale.client_name}</span>
                                                    <span className="w-1/5">{setCurrencyFormat(sale.paid_today)}</span>
                                                    <span className="w-1/5">{setCurrencyFormat(sale.total_paid)}</span>
                                                    <span className="w-1/5">{setCurrencyFormat(sale.billing)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center mt-2">No sales data available for this date.</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end text-green-800 dark:text-green-400 font-bold mt-3">
                                        <div className='flex items-center gap-1'>
                                            <span className='text-sm'>Daily Sales Total:</span>
                                            <h1 className='text-lg'>{setCurrencyFormat(reportData.dailySalesTotal)}</h1>
                                        </div>
                                    </div>
                                </div>

                                {/* Expenses Breakdown */}
                                <div id='expensesBreakdown' className='my-5'>
                                    <h3 className="text-lg font-semibold text-center text-red-800 dark:text-red-400 mb-4">Expenses Breakdown</h3>
                                    <div className="rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 border-b-0">
                                        <div className="category-details__header flex items-center bg-[#1E1E1E] dark:bg-[#080808] rounded px-3 py-2">
                                            <h3 className={`${tableHStyle} w-1/4`}>Description</h3>
                                            <h3 className={`${tableHStyle} w-1/4`}>Value</h3>
                                            <h3 className={`${tableHStyle} w-1/4`}>Payment Method</h3>
                                            <h3 className={`${tableHStyle} w-1/4`}>Observation</h3>
                                        </div>
                                        {reportData.expenses && reportData.theExpenses.length > 0 ? (
                                            reportData.theExpenses.map((expense, index) => (
                                                <div key={index} className={`flex justify-between px-3 py-3 my-1 rounded-md ${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <span className="w-1/4">{expense.description}</span>
                                                    <span className="w-1/4">{setCurrencyFormat(expense.expense_amount)}</span>
                                                    <span className="w-1/4">{expense.payment_method}</span>
                                                    <span className="w-1/4">{expense.obs}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center mt-2">No expenses data available for this date.</p>
                                        )}
                                        <div className="flex justify-end text-red-800 dark:text-red-400 font-bold mt-3">
                                            <div className='flex items-center gap-1'>
                                                <span className='text-sm'>Total Expenses Today:</span>
                                                <h1 className='text-lg'>{setCurrencyFormat(reportData.expenses)}</h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {balances && Object.entries(balances).map(([key, balance]) => (
                                    <div key={key} className="flex justify-around p-4 rounded-lg shadow-md mb-4 bg-gray-100 dark:bg-gray-800">
                                        <div className="flex flex-col items-center">
                                            <h1 className={`text-2xl ${balance.openingCash < 0 ? 'text-red-500' : 'text-green-600'} dark:${balance.openingCash < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {setCurrencyFormat(balance.openingCash)}
                                            </h1>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">Opening {key}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <h1 className={`text-2xl ${balance.todayCashTotal < 0 ? 'text-red-500' : 'text-blue-500'} dark:${balance.todayCashTotal < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                                {setCurrencyFormat(balance.todayCashTotal)}
                                            </h1>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">Today's {key}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <h1 className={`text-2xl ${balance.closingCash < 0 ? 'text-red-500' : 'text-green-600'} dark:${balance.closingCash < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {setCurrencyFormat(balance.closingCash)}
                                            </h1>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">Closing {key} Balance</span>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <RightButton name={'Download PDF'} />
                <label className='flex items-center gap-1 border-b border-black pb-1 mt-3'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Help")}</h1>
                </label>
                <div className='text-sm'>
                    <strong>{splitText("How does the report work?")}</strong>
                    <p className='my-2'>{splitText("This report shows the daily cash flow, sales, and expenses breakdown.")}</p>
                </div>
            </div>
        </main>
    );
};

export default DailySalesReport;
