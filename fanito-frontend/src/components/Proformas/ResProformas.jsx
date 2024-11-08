import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import RightButton from '../Buttons/RightButton';
import axios from 'axios';
import { API_URL } from '../../constant/config';
import getTokenConfig from '../../axiosconfig/config';
import InvoiceComponent from '../Invoices/Componets/InvoiceComponent';

const ResProformas = () => {
    const navigate = useNavigate();
    const { invoiceId } = useParams();
    const [invoiceData, setInvoiceData] = useState(null);
    const [isDraft, setIsDraft] = useState(true);

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

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await axios.get(`${API_URL}/invoices/invoice/${invoiceId}`, getTokenConfig());
                setInvoiceData(response.data);
                setIsDraft(response.data.invoice.status === 'draft');
            } catch (err) {
                console.error('Error fetching invoice data:', err);
            }
        };

        fetchInvoice();
    }, [invoiceId]);

    const transformInvoice = async () => {
        try {
            await axios.put(`${API_URL}/invoices/invoice/${invoiceId}/itype`, { itype: 'Invoice' }, getTokenConfig());
            // console.log(re)
            // setIsDraft(false);
            // Optionally, refetch invoice data to ensure UI is updated
            // const response = await axios.get(`${API_URL}/invoices/invoice/${invoiceId}`, getTokenConfig());
            navigate(`/invoices/daft/${invoiceId}`);
            // setInvoiceData(response.data);
        } catch (err) {
            console.error('Error finalizing invoice:', err);
        }
    };

    const downloadPDF = async () => {
        try {
            const response = await axios.get(`${API_URL}/invoicespdf/invoice/${invoiceId}/pdf`, {
                responseType: 'blob', // Ensure responseType is 'blob'
                ...getTokenConfig()
            });
    
            // Check response status and data
            if (response.status === 200 && response.data) {
                // Create a blob URL and trigger download
                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `invoice-${invoiceId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Unexpected response status or empty data:', response);
            }
        } catch (err) {
            console.error('Error downloading PDF:', err);
        }
    };

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1 mb-5'>
                    <h1 className="text-3xl">{splitText("Proforma")}</h1>
                    {invoiceData&& <h1 className="text-3xl text-orange-600">{splitText(`${invoiceData.invoice.status === 'draft'? 'Rascunho*':''}`)}</h1>}
                </div>
                {invoiceData && 
                    <InvoiceComponent 
                        invoice={invoiceData.invoice} 
                        items={invoiceData.items} 
                        companyDetails={invoiceData.companyDetails} 
                        bankAccounts={invoiceData.bankAccounts} 
                        docCustomizations={invoiceData.docCustomizations}
                    />
                }
            </div>
            {<div className='w-[300px] flex flex-col justify-start gap-4'>
                <RightButton name={'Accept'} onClick={transformInvoice} />
                {/* <RightButton name={'Editar'} /> */}
                <h1 className='-mb-1 mt-4 text-sm'>Actions on the document</h1>
                <RightButton name={'Download PDF'} onClick={downloadPDF}/>
                <h1 className='-mb-1 mt-4 text-sm'>Other actions on the document</h1>
                <RightButton name={'Delete'} />
                <RightButton name={'Clone'} onClick={() => navigate(`/proformas/clone/${invoiceId}/${'Proforma'}`)} />
            </div>}
        </main>
    )
}

export default ResProformas;