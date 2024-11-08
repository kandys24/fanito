import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BsPatchQuestionFill } from 'react-icons/bs';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';
import setCurrencyFormat from '../../constant/setCurrencyFormat';
import RightButton from '../Buttons/RightButton';

const ClientInvoiceReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [clientData, setClientData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchClientInvoiceReport = async () => {
        if (!startDate || !endDate) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                ...getTokenConfig(),
                params: { startDate, endDate },
            };
            const response = await axios.get(`${API_URL}/comreport/client-invoice-report`, config);
            setClientData(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch client invoice report');
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
                    <h1 className="text-3xl">{splitText("Client Billing Report")}</h1>
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
                                    onClick={fetchClientInvoiceReport} 
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
                        {!loading && !error && clientData.length > 0 && (
                            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-md text-center">
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Billing by Clients:</h3>
                                <ul className="text-green-900 dark:text-green-300">
                                    {clientData.map((client, index) => (
                                        <li key={index} className="my-2">
                                            <strong>{client.client_name}:</strong> {setCurrencyFormat(client.total_invoiced)}
                                        </li>
                                    ))}
                                </ul>
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
                    <strong>{splitText("How the report works?")}</strong>
                    <p className='my-2'>{splitText("This report displays the total billed by each client during the selected date range.")}</p>
                </div>
            </div>
        </main>
    );
}

export default ClientInvoiceReport;