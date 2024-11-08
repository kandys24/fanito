import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../constant/config';
import getTokenConfig from '../../../axiosconfig/config';
import setCurrencyFormat from '../../../constant/setCurrencyFormat';

const InvoiceSummary = () => {
    const [summaryShow, setSummaryShow] = useState(false);
    const [summaryData, setSummaryData] = useState(null);

    // Fetch the invoice summary data
    const fetchSummary = async () => {
        try {
            const config = getTokenConfig();
            const response = await axios.get(`${API_URL}/invoices/summary`, config);
            setSummaryData(response.data.summary);
        } catch (error) {
            console.error('Error fetching invoice summary:', error);
        }
    };

    useEffect(() => {
        
            fetchSummary();
        if (summaryShow) {}
    }, [summaryShow]);

    return (
        <div id='myTableProduct_main' className='flex-1 text-xs mt-6'>
            <div className="flex gap-2 py-1.5 pb-0.5 mb-1 bg-[#1E1E1E] dark:bg-[#080808] text-white rounded">
                <div className="flex-1 py-0.5 pl-3">Summary ({summaryData && summaryData?.total_invoices} document{summaryData && (summaryData?.total_invoices === 1 || summaryData?.total_invoices === 0 ? '' : 's')}) </div>
            </div>
            {summaryShow && summaryData ? (
                <>
                    <div className={`mb-2`}>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Drafts:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(summaryData.draft_total)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Canceled:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(summaryData.canceled_total)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Within Deadline:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(summaryData.within_due_date_total)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Overdue:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(summaryData.overdue_total)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Paid:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(summaryData.total_paid)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Net Total:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(summaryData.total_without_tax)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Tax/VAT:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(summaryData.total_tax)}</div>
                        </div>
                    </div>
                    <div className="flex gap-2 py-1.5 pb-0.5 mb-1 border-t border-black">
                        <div className="w-20 py-0.5 pl-3 font-bold">Total:</div>
                        <div className="flex-1 py-0.5 text-end pr-3 font-bold">
                            {setCurrencyFormat(summaryData.total_without_tax + summaryData.total_tax)}
                        </div>
                    </div>
                </>
            ) : (
                <button
                    className={`w-full text-sm py-3 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                                bg-[#f1f1f1] dark:bg-black
                                text-black dark:text-white 
                                hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                                active:scale-95 active:shadow-inner`}
                    onClick={() => setSummaryShow(true)}
                >
                    Calculate Summary
                </button>
            )}
        </div>
    );
};

export default InvoiceSummary;