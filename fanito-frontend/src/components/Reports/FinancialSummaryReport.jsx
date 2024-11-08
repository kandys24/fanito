import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import { BsPatchQuestionFill } from 'react-icons/bs';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import setCurrencyFormat from '../../constant/setCurrencyFormat';
import RightButton from '../Buttons/RightButton';

const FinancialSummaryReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFinancialSummaryReport = async () => {
        if (!startDate || !endDate) {
            return;
        }
    
        try {
            setLoading(true);
            const config = {
                ...getTokenConfig(),
                params: { startDate, endDate },
            };
            const response = await axios.get(`${API_URL}/comreport/financial-summary-report`, config);
            setSummaryData(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch financial summary report');
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

    return (
        <main className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl">
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("General Report profits")}</h1>
                </div>
                <div className="mt-5">
                    <div className="flex flex-col gap-4">
                        <div className='flex items-end gap-3'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium mb-1">Start Date:</label>
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring focus:ring-blue-500"
                                />
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium mb-1">End Date:</label>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring focus:ring-blue-500"
                                />
                            </div>
                            <div className='w-1/2'>
                                <button 
                                    onClick={fetchFinancialSummaryReport} 
                                    className="w-full text-sm py-5 px-10 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                                        bg-[#f1f1f1] dark:bg-black
                                        text-black dark:text-white 
                                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                                        active:scale-95 active:shadow-inner"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {loading && <p className="text-blue-500 font-semibold">Loading...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && !error && summaryData && (
                            <div id='financialSummary' className='flex justify-between mt-5 bg-white py-5 px-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                                <div className='flex flex-col items-center'>
                                    <h1 className='text-2xl'>{setCurrencyFormat(summaryData.totalBilling)}</h1>
                                    <span className='text-sm'>Total Billing</span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <h1 className='text-2xl'>{setCurrencyFormat(summaryData.totalTax)}</h1>
                                    <span className='text-sm'>Total Tax</span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <h1 className='text-2xl'>{setCurrencyFormat(summaryData.totalExpenses)}</h1>
                                    <span className='text-sm'>Total Expenses</span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <h1 className='text-2xl'>{setCurrencyFormat(summaryData.income)}</h1>
                                    <span className='text-sm'>Income</span>
                                </div>
                            </div>
                        )}

                        {!loading && !error && summaryData && summaryData.paymentMethods.length > 0 && (
                            <div id='paymentBreakdown' className='mt-5 bg-white py-5 px-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                                {/* <h3 className="text-lg font-semibold text-center text-green-800 dark:text-green-400 mb-4">Payment Method Breakdown</h3> */}
                                <div className='flex justify-around'>
                                    {summaryData.paymentMethods.map((method, index) => (
                                        <div key={index} className='flex flex-col items-center'>
                                            <h1 className='text-2xl'>{setCurrencyFormat(method.total_paid)}</h1>
                                            <span className='text-sm'>{method.payment_method}</span>
                                        </div>
                                    ))}
                                </div>
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
                    <p className='my-2'>{splitText("This report shows the total billing, total tax, total expenses, and the calculated income for the selected date range.")}</p>
                </div>
            </div>
        </main>
    );
};

export default FinancialSummaryReport;