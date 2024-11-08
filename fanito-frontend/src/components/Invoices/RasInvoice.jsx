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
import CancellationModal from './Componets/CancellationModal';
import MainNotifications from '../Notifications/MainNotifications';
import CloneModal from './Componets/CloneModal';

const RasInvoice = () => {
    const navigate = useNavigate();
    const { invoiceId } = useParams();
    const [invoiceData, setInvoiceData] = useState(null);
    const [isDraft, setIsDraft] = useState(true);
    const [newReceiptModal, setNewReceiptModal] = useState(false);
    const [cancellationModal, setCancellationModal] = useState(false);
    const [cloneModal, setCloneModal] = useState(false);
    const [isToShowNotify, setIsToShowNotify] = useState(false);
    const [theMessage, setTheMessage] = useState('You cannot cancel a paid invoice, you have to cancel a payment/receipt.');
    const [theStyles, setTheStyles] = useState('bg-red-300 text-red-600 dark:bg-red-300 dark:text-red-600');

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

    const finalizeInvoice = async () => {
        try {
            await axios.put(`${API_URL}/invoices/invoice/${invoiceId}/status`, { status: 'final' }, getTokenConfig());
            setIsDraft(false);
            // Optionally, refetch invoice data to ensure UI is updated
            const response = await axios.get(`${API_URL}/invoices/invoice/${invoiceId}`, getTokenConfig());
            setInvoiceData(response.data);
        } catch (err) {
            console.error('Error finalizing invoice:', err);
        }
    };

    const handleApagar = async () =>{
        try {
            const response = await axios.delete(`${API_URL}/invoices/apagarinvoice/${invoiceId}`, getTokenConfig());
            if(response.data.message === 'Invoice deleted successfully'){
                setTheMessage('Invoice deleted successfully');
                setTheStyles('bg-green-300 text-green-600 dark:bg-green-300 dark:text-green-600')
                setIsToShowNotify(true);

                // Automatically hide notification after some time (optional if not using internal timer)
                setTimeout(() => {
                    setIsToShowNotify(false);
                }, 5000);
                navigate(`/invoices`);
            }else{
                setTheMessage('Error deleting, please try again later');
                setTheStyles('bg-yellow-300 text-yellow-600 dark:bg-yellow-300 dark:text-yellow-600')
                setIsToShowNotify(true);

                // Automatically hide notification after some time (optional if not using internal timer)
                setTimeout(() => {
                    setIsToShowNotify(false);
                }, 5000);
                return
            }
        } catch (err) {
            console.error('Error deleting invoice:', err);
        }
    }

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

    const closeNewReceiptModal = () =>{
        setNewReceiptModal(false);
    }

    const openNewReceiptModal = () =>{
        setNewReceiptModal(true);
    }
    
    //CancellationModal
    const closeCancellationModal = () =>{
        setCancellationModal(false);
    }

    const openCancellationModal = () =>{
        if(invoiceData?.receipts?.totalpaid > 0){
            setTheMessage('You cannot cancel a paid invoice, you have to cancel a payment/receipt.');
            setTheStyles('bg-red-300 text-red-600 dark:bg-red-300 dark:text-red-600')
            setIsToShowNotify(true);

            // Automatically hide notification after some time (optional if not using internal timer)
            setTimeout(() => {
                setIsToShowNotify(false);
            }, 5000);
            return
        }
        setCancellationModal(true);
    }

    //cone
    const closeConeModal = () =>{
        setCloneModal(false);
    }

    const openConeModal = () =>{
        setCloneModal(true);
    }

    const handleCreditNote = () =>{
        if(invoiceData?.receipts?.totalpaid > 0){
            setTheMessage('You cannot create a credit note from a paid invoice, you have to cancel a payment');
            setTheStyles('bg-yellow-300 text-yellow-600 dark:bg-yellow-300 dark:text-yellow-600');
            setIsToShowNotify(true);

            // Automatically hide notification after some time (optional if not using internal timer)
            setTimeout(() => {
                setIsToShowNotify(false);
            }, 5000);
            return
        }
        navigate(`/invoices/adjustment/${invoiceId}/CreditNote`);
    }

    return (   
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1 mb-5'>
                    <h1 className="text-3xl">{splitText(`${invoiceData?.invoice?.document_type}`)}</h1>
                    {invoiceData&& <h1 className="text-3xl text-orange-600">{splitText(`${invoiceData.invoice.status === 'draft'? 'Rascunho*':''}`)}</h1>}
                </div>
                {invoiceData && 
                    <InvoiceComponent 
                        invoice={invoiceData.invoice} 
                        items={invoiceData.items} 
                        companyDetails={invoiceData.companyDetails} 
                        bankAccounts={invoiceData.bankAccounts} 
                        docCustomizations={invoiceData.docCustomizations}
                        cancellationReason={invoiceData.cancellationReason}
                    />
                }
            </div>
            {isDraft 
            ?<div className='w-[300px] flex flex-col justify-start gap-4'>
                <RightButton name={'Finish'} onClick={finalizeInvoice} />
                <RightButton name={'Edit'} />
                <h1 className='-mb-1 mt-4 text-sm'>Actions on the document</h1>
                <RightButton name={'Download PDF'} onClick={downloadPDF}/>
                <h1 className='-mb-1 mt-4 text-sm'>Other actions on the document</h1>
                <RightButton name={'Delete'} onClick={handleApagar} />
                <RightButton name={'Clone'} onClick={openConeModal} />
            </div>
            :<div className='w-[300px] flex flex-col justify-start gap-4'>
                {invoiceData.invoice.status != 'canceled' && invoiceData && (invoiceData.receipts.totalpaid < invoiceData.invoice.total_amount)
                    ?<RightButton name={'Payment/Receipt'} onClick={openNewReceiptModal} />
                    :<RightButton name={'New Invoice'} onClick={() => navigate(`/invoices/new`)} />
                }
                {invoiceData.invoice.status != 'canceled' &&<RightButton name={'Cancel'} onClick={openCancellationModal} />}
                <h1 className='-mb-1 mt-4 text-sm'>Actions on the document</h1>
                <RightButton name={'Download PDF'} onClick={downloadPDF}/>
                {/* <RightButton name={'Download 2a via'}/> */}
                <h1 className='-mb-1 mt-4 text-sm'>Other actions on the document</h1>
                {/* <RightButton name={'Enviar'} /> */}
                <RightButton name={'Clone'} onClick={openConeModal} />
                <RightButton name={'Archive'} />
                <h1 className='-mb-1 mt-4 text-sm'>Corrections to the document</h1>
                <RightButton name={'Credit Note'} onClick={handleCreditNote} />
                {invoiceData && invoiceData.receipts.payments?.length > 0 &&
                    (<div className='flex flex-col gap-4'>
                        <h1 className='-mb-1 mt-4 text-sm'>Related documents</h1> 
                        {invoiceData.receipts?.payments.map((receipt, i) => (
                            <div 
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
            </div>}
            {newReceiptModal && <NewReceiptModal invoice={invoiceData.invoice} totalpaid={invoiceData.receipts.totalpaid} closeNewReceiptModal={closeNewReceiptModal} />}
            {cancellationModal && <CancellationModal doc_id={invoiceData.invoice.invoice_id} doc_type={invoiceData.invoice.document_type} doc_code={invoiceData.invoice.invoice_code}  closeCancellationModal={closeCancellationModal} />}
            {cloneModal && <CloneModal invoiceId={invoiceId} closeConeModal={closeConeModal} />}
            {/* Notifications  */}
            {<MainNotifications
                isToShowNotify={isToShowNotify}
                notificationMessage={theMessage}
                style={theStyles}
            />}
        </main>
    )
}

export default RasInvoice;