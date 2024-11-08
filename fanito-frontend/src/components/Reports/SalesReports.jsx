import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BsPatchQuestionFill } from 'react-icons/bs';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';
import setCurrencyFormat from '../../constant/setCurrencyFormat';
import RightButton from '../Buttons/RightButton';

const SalesReports = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalTax, setTotalTax] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTaxReport = async () => {
        if(!startDate && !endDate){
            return
        }

        try {
            setLoading(true);
            const config = {
                ...getTokenConfig(),
                params: {
                    startDate,
                    endDate,
                },
            };
            const response = await axios.get(`${API_URL}/comreport/invoice-totals-report`, config);
            setTotalTax(response.data.total_invoices);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch tax report');
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
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Total Invoiced")}</h1>
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
                                    onClick={fetchTaxReport} 
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
                        {totalTax !== null && !loading && !error && (
                            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-md text-center">
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Total Invoiced:</h3>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-300">{setCurrencyFormat(totalTax)}</p>
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
                    <strong>{splitText("What are the reports for?")}</strong>
                    <p className='my-2'>{splitText("A report serves to consolidate the stored data, creating tables that will provide information about the billing volume.")}</p>
                </div>
            </div>
        </main>
    )
}

export default SalesReports;