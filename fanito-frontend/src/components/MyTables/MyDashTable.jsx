import React, { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import setCurrencyFormat from '../../constant/setCurrencyFormat';
import formatDate from '../../constant/formatDate';

const MyDashTable = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data for the top 5 invoices
        axios.get(`${API_URL}/reportdash/top-invoices`, getTokenConfig())
            .then((response) => {
                setInvoices(response.data);
                setLoading(false);
            })
            .catch((error) => {
                setError('Failed to fetch invoices');
                setLoading(false);
            });
    }, []);

    useGSAP(() => {
        gsap.fromTo('#myDashTable_main', {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                delay: 0.5,
                stagger: 0.05,
                onComplete: () =>{
                    shadow: 5
                }
            }
        );
    }, []);

    return (
        <div id='myDashTable_main' className="w-full text-md mb-1.5 pb-1">
            <div className="flex px-2 py-1.5 pb-0.5 mb-1 bg-[#1E1E1E] dark:bg-[#080808] text-white rounded">
                {/* Header Row */}
                <div className="flex-1 py-0.5">Billing</div>
                <div className="flex-1 py-0.5 text-center">Paid</div>
                <div className="flex-1 py-0.5 text-center">Without Tax</div>
                <div className="flex-1 py-0.5 text-center">Tax</div>
                <div className="flex-1 py-0.5 text-right">Date</div>
            </div>
            {/* Loading State */}
            {loading && <p>Loading...</p>}
            
            {/* Error State */}
            {error && <p>{error}</p>}
            
            {/* Table Content */}
            {!loading && !error && invoices.length > 0 && invoices.map((invoice, index) => (
                <div key={index} className={`mb-0.5 ${index % 2 !== 0 ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {/* Product Details Row */}
                    <div className="flex flex-row py-0 px-2 rounded">
                        <div className="flex-1 py-0.5">{setCurrencyFormat(invoice.billing)}</div>
                        <div className="flex-1 py-0.5 text-center">{setCurrencyFormat(invoice.paid)}</div>
                        <div className="flex-1 py-0.5 text-center">{setCurrencyFormat(invoice.without_tax)}</div>
                        <div className="flex-1 py-0.5 text-center">{setCurrencyFormat(invoice.tax)}</div>
                        <div className="flex-1 py-0.5 text-right">{formatDate(invoice.date)}</div>
                    </div>
                </div>
            ))}

            {/* No data state */}
            {!loading && !error && invoices.length === 0 && (
                <p>No invoices found</p>
            )}
        </div>
    );
};

export default MyDashTable;
