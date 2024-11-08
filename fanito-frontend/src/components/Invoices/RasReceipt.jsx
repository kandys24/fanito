import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import InvoiceComponent from './Componets/InvoiceComponent';
import RightButton from '../Buttons/RightButton';
import axios from 'axios';
import { API_URL } from '../../constant/config';
import getTokenConfig from '../../axiosconfig/config';
import NewReceiptModal from './Componets/NewReceiptModal';
import setCurrencyFormat from '../../constant/setCurrencyFormat';
import ReceiptComponent from './Componets/ReceiptComponent';
import CancellationModal from './Componets/CancellationModal';

const RasReceipt = () => {
    const navigate = useNavigate();
    const { invoiceId, receiptId } = useParams();
    const [invoiceData, setInvoiceData] = useState(null);
    const [cancellationModal, setCancellationModal] = useState(false);   

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
                const response = await axios.get(`${API_URL}/comreceipt/invoice/${invoiceId}/receipt/${receiptId}`, getTokenConfig());
                setInvoiceData(response.data);
                // console.log(response.data.receipt)
            } catch (err) {
                console.error('Error fetching invoice data:', err);
            }
        };

        fetchInvoice();
    }, [invoiceId, receiptId]);

    const downloadPDF = async () => {
        try {
            const response = await axios.get(`${API_URL}/receiptpdf/receipt/${invoiceId}/${receiptId}/pdf`, {
                responseType: 'blob', // Ensure responseType is 'blob'
                ...getTokenConfig()
            });
    
            // Check response status and data
            if (response.status === 200 && response.data) {
                // Create a blob URL and trigger download
                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `receipt-${receiptId}.pdf`);
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

    const closeCancellationModal = () =>{
        setCancellationModal(false);
    }

    const openCancellationModal = () =>{
        setCancellationModal(true);
    }    

    return (   
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1 mb-5'>
                    <h1 className="text-3xl">{splitText("Receipt")}</h1>
                    {/* {invoiceData&& <h1 className="text-3xl text-orange-600">{splitText(`${invoiceData.invoice.status === 'draft'? 'Rascunho*':''}`)}</h1>} */}
                </div>
                {invoiceData && 
                    <ReceiptComponent 
                        invoice={invoiceData.invoice} 
                        items={invoiceData.items} 
                        companyDetails={invoiceData.companyDetails} 
                        bankAccounts={invoiceData.bankAccounts} 
                        docCustomizations={invoiceData.docCustomizations}
                        receipt={invoiceData.receipt}
                        cancellationReason={invoiceData.cancellationReason}
                    />
                }
            </div>
            {<div className='w-[300px] flex flex-col justify-start gap-4'>
                {invoiceData && (invoiceData.receipts.totalpaid >= invoiceData.invoice.total_amount) 
                    &&<RightButton name={'New Invoice'} onClick={() => navigate(`/invoices/new`)} />
                }
                <RightButton name={'Cancel'} onClick={openCancellationModal} />
                <h1 className='-mb-1 mt-4 text-sm'>Outras Acções sobre o documento</h1>
                <RightButton name={'Download PDF'} onClick={downloadPDF}/>
                {invoiceData && invoiceData.receipts.payments &&
                    (invoiceData.receipts.totalpaid > 0 && <div className='flex flex-col gap-4'>
                        <h1 className='-mb-1 mt-4 text-sm'>Documentos relacionados</h1> 
                        {invoiceData.receipts?.payments.map((receipt, i) => (
                            (receiptId != receipt.receipt_id) && <div 
                                key={i} onClick={() => navigate(`/invoices/receipt/${invoiceId}/${receipt.receipt_id}`)}
                                className={`flex flex-1 justify-between items-center cursor-pointer gap-1
                                    text-sm py-3 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                                    bg-[#f1f1f1] dark:bg-black 
                                    text-black dark:text-white 
                                    hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                                    active:scale-95 active:shadow-inner   
                                `}
                            >
                                <div className='flex gap-2 items-center'>
                                    <div className={`p-1 border rounded
                                        ${receipt.status === 'final' ? 'bg-green-300 text-green-900 border-green-900' : 'bg-red-300 text-red-900 border-red-900'}`}>
                                        {receipt.status === 'final' ? 'P' : 'C'}
                                    </div>
                                    <div className='flex flex-col justify-between'>
                                        <div>{'Receipt'}</div>
                                        <div className='text-[12px]'>{receipt.receipt_code}</div>
                                    </div>
                                </div>
                                <div className='text-xs'>
                                    {setCurrencyFormat(receipt.paid)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {invoiceData &&( 
                    <div className='flex flex-col gap-4'>
                        {invoiceData.invoice &&(
                            <div 
                                onClick={() => navigate(`/invoices/daft/${invoiceId}`)}
                                className={`flex flex-1 justify-between items-center cursor-pointer gap-1
                                    text-sm py-3 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                                    bg-[#f1f1f1] dark:bg-black 
                                    text-black dark:text-white 
                                    hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                                    active:scale-95 active:shadow-inner   
                                `}
                            >
                                <div className='flex gap-2 items-center'>
                                    <div className={`p-1 border rounded
                                        ${invoiceData.invoice.status === 'final' ? 'bg-green-300 text-green-900 border-green-900' : 'bg-red-300 text-red-900 border-red-900'}`}>
                                        {invoiceData.invoice.status === 'final' ? 'P' : 'C'}
                                    </div>
                                    <div className='flex flex-col justify-between'>
                                        <div>{'Invoice'}</div>
                                        <div className='text-[12px]'>{invoiceData.invoice.invoice_code}</div>
                                    </div>
                                </div>
                                <div className='text-xs'>
                                    {setCurrencyFormat(invoiceData.invoice.total_amount)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>}
            {cancellationModal && <CancellationModal doc_id={invoiceData.receipt.receipt_id} doc_type={invoiceData.receipt.document_type} doc_code={invoiceData.receipt.receipt_code}  closeCancellationModal={closeCancellationModal} />}
        </main>
    )
}

export default RasReceipt