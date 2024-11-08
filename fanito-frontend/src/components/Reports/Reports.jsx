import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BsPatchQuestionFill } from 'react-icons/bs';
import ReportCards from './Components/ReportCards';

const Reports = () => {

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
                    <h1 className="text-3xl">{splitText("Reports")}</h1>
                </div>
                <ReportCards />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
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

export default Reports;