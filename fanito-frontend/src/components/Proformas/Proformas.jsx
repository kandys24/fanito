import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LeftButton from '../Buttons/LeftButton';
import TableInvoices from '../Invoices/Componets/TableInvoices';
import { BsPatchQuestionFill } from 'react-icons/bs';

const Proformas = () => {

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
                    <h1 className="text-3xl">{splitText("Proforma")}</h1>
                </div>
                <TableInvoices invotype={'Proforma'} />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <LeftButton name={'New Proforma'} to={'/proformas/new'}/>
                <label className='flex items-center gap-1 border-b border-black pb-1 mt-3'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Help")}</h1>
                </label>
                <div className='text-sm'>
                    <strong>{splitText("What is a proforma?")}</strong>
                    <p className='my-2'>{splitText("Document that certifies to third parties (insurance companies, banks, etc.) that the invoice to be issued will effectively be the same as this.")}</p>
                </div>
            </div>
        </main>
    )
}

export default Proformas;