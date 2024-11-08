import React, { useEffect, useState } from 'react';
import { BsPatchQuestionFill } from "react-icons/bs";
import { FaSearch } from 'react-icons/fa';
import InputClient from './Componets/InputClient';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import DocDetails from './Componets/DocDetails';
import TableProduct from './Componets/TableProduct';
import getTokenConfig from '../../axiosconfig/config';
import axios from 'axios';
import { API_URL } from '../../constant/config';
import RightButton from '../Buttons/RightButton';
import { useNavigate } from 'react-router-dom';

const typeofinvo = 'Invoice-Receipt'; 

const NewInvoiceReceipt = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [client, setClient] = useState(null);
    const [series, setSeries] = useState(null);
    const [formData, setFormData] = useState({
        data: new Date().toString(),
        vencimento: 'Pronto Pagamento',
        ref: '',
        observacoes: '',
        serie: '2024',
        retencao: '',
        meioPagamento: 'Cash',
        document_type: typeofinvo,
        document_style: 'A4',
    });
    const [total, setTotal] = useState({ 
        sum: 0, 
        discount: 0, 
        retention: 0, 
        withoutTax: 0, 
        tax: 0, 
        totalWithTax: 0,
        totalTax: 0
    });
    const [carts, setCarts] = useState([]);
    const [isToShowNotify, setIsToShowNotify] = useState(false);
    const [isToCheck, setIsToCheck] = useState(false);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
    };

    const fetchClients = async (page, search) => {
        try {
            const config = {
                ...getTokenConfig(),
                params: {
                    page,
                    limit: 15, // Assuming 10 records per page
                    search,
                },
            };
            const response = await axios.get(`${API_URL}/comclient/clients-invo`, config);
            setClients(response.data.clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        if (searchValue) {
            fetchClients(1, searchValue);} 
        else {
            setClients([]);
        }
    }, [searchValue]);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/series/get-series`, config);
                setSeries(response.data.series);
                // console.log(response.data.series);
            } catch (error) {
                console.error('Error fetching series:', error);
            }
        };
        
        fetchSeries();
    }, []);

    const handleSelect = (client) => {
        setClient(client); // Show the selected client's details
        setSearchValue(''); // Clear search input
        setClients([]); // Hide suggestions
    };

    const handEmptyUser = () => {
        setClient(null); // Show the selected client's details
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

    const handledraft = async () =>{
        setIsToShowNotify(!isToShowNotify);
        
        if(!client?.name){
            setIsToCheck(true);
        }

        if(!client?.name || !client.name || total?.totalWithTax <= 0){
            console.log(client?.name)
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/invoices/add-invoice`, {
                client_id: client.client_id,
                client_name: client.name,
                client_tax_id: client.document_number,
                client_email: client.email,
                client_address: client.address,
                client_po_box: client.postal_box,
                client_city: client.city,
                document_type: formData.document_type,
                document_style: formData.document_style,
                document_date: new Date().toISOString().split('T')[0],
                due_date: formData.vencimento,
                payment_method: formData.meioPagamento,
                series: formData.serie,
                remarks: formData.observacoes,
                retention_percentage: formData.retencao,
                status: 'final',
                total_amount: total.totalWithTax,
                retention_amount: total.retention,
                taxable_amount: total.withoutTax,
                tax_amount: total.tax,
                items: carts
            }, getTokenConfig());
    
            if (response.status === 201) {
                // alert('Invoice and client added successfully!');
                // Reset form or redirect user to another page
                setIsToCheck(false);
                navigate(`/invoices/daft/${response.data.invoice_id}`);
            }
        } catch (error) {
            console.error('Error adding invoice and client:', error);
            // alert('Failed to add invoice. Please try again.');
        }

    }

    return (
        <main 
            className="flex gap-20 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("New Invoice-receipt")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                {!client ?(
                    <div className='relative mt-4 px-5'>
                        <div className='relative'>
                            <input 
                                placeholder='Procure um cliente' 
                                type='text' 
                                className='w-full py-2 px-8 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm
                                    text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400
                                '
                                value={searchValue} 
                                onChange={handleChange} 
                                name='search'
                                autoComplete="off"
                            />
                            <FaSearch className='absolute z-1 top-[13px] ml-3 text-[0.8rem]'/>
                        </div>
                        {/* Suggestions List */}
                        {clients.length > 0 && (
                            <ul className="absolute bg-white dark:bg-[#0e0e0e] text-sm shadow-lg rounded-lg w-full max-h-72 overflow-y-auto z-10">
                                <li key={'novo_1'} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <button 
                                        type="button" 
                                        onClick={handleSelect} 
                                        className="block w-full text-left py-2 px-4 font-bold text-blue-600 dark:text-blue-400"
                                    >
                                        + Novo Cliente
                                    </button>
                                </li>
                                {clients.map((client, index) => (
                                    <li key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <button 
                                            type="button" 
                                            onClick={() => handleSelect(client)} 
                                            className="block w-full text-left py-2 px-4 text-gray-900 dark:text-gray-100"
                                        >
                                            {client.name} ({client.email})
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )
                :<InputClient handEmptyUser={handEmptyUser} client={client} setClient={setClient} isToCheck={isToCheck} />
                }
                <DocDetails typeofinvo={typeofinvo} formData={formData} setFormData={setFormData} client={client} series={series} />
                <TableProduct carts={carts} setCarts={setCarts} total={total} setTotal={setTotal} isToShowNotify={isToShowNotify} />
                <div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div>Payment scheduled by Fanito for 09/17/2024</div>
                    <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={()=>navigate(-1)} />
                        <RightButton name={'Save as draft'} onClick={handledraft} />
                    </div>
                </div>
            </div>
            <div className='w-[255px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Help")}</h1>
                </label>
                <p>{splitText("New Client?\n")}
                    {splitText("\nIf this document is for a new client, simply fill in the 'Client Data'")}
                </p>
            </div>
        </main>
    )
}

export default NewInvoiceReceipt;