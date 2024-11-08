import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LeftButton from '../Buttons/LeftButton';
import TableClients from './Components/TableClients';

const Contacts = () => {

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
                    <h1 className="text-3xl">{splitText("Clients")}</h1>
                </div>
                <TableClients />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <LeftButton name={'New Client'} to={'/clients/new'}/>
                <label className='flex items-center gap-1 border-b border-black pb-1 mt-3'>
                    <h1 className="text-sm">{splitText("Client Reports")}</h1>
                </label>
                <div className='text-sm text-gray-500 dark:text-black'>
                    <p className='mb-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{splitText("Client current account")}</p>
                    <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{splitText("Missing payments")}</p>
                </div>
            </div>
        </main>
    )
}

export default Contacts;