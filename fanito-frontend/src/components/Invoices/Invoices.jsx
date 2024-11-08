import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LeftButton from '../Buttons/LeftButton';
import TableInvoices from './Componets/TableInvoices';
import InvoiceSummary from './Componets/InvoiceSummary';

const Invoices = () => {

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
                    <h1 className="text-3xl">{splitText("Invoices")}</h1>
                </div>
                <TableInvoices invotype={"Invoice Credit-Note Invoice-Receipt"} />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <LeftButton name={'New Invoice'} to={'/invoices/new'} />
                <LeftButton name={'New Invoice-receipt'} to={'/invoices/invoicereceipt/new'} />
                {/* <LeftButton name={'Nova nota de débito'} to={'/invoices/debitnote/new'}/> */}
                {/* <LeftButton name={'Nova autofacturação'} to={'/invoices/selfbilling/new'}/> */}
                {/* <LeftButton name={'Nova factura global'} /> */}
                {/* <LeftButton name={'Nova factura global'} /> */}
                <InvoiceSummary />
            </div>
        </main>
    )
}

export default Invoices;