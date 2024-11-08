import React, { useState } from 'react';
import { BsPatchQuestionFill } from "react-icons/bs";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import TableExpenses from './Components/TableExpenses';
import NewExpenseModal from './Components/NewExpenseModal';
import RightButton from '../Buttons/RightButton';

const Expenses = () => {
    const [newExpenseModal, setNewExpenseModal] = useState(false);

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

    const closeNewExpenseModal = () =>{
        setNewExpenseModal(false);
    }

    const openNewExpenseModal = () =>{
        setNewExpenseModal(true);
    }

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Expenses")}</h1>
                </div>
                <TableExpenses newExpenseModal={newExpenseModal} />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <RightButton name={'New Expenses'} onClick={openNewExpenseModal}/>
                <label className='flex items-center gap-1 border-b border-black pb-1 mt-3'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Expense Reports")}</h1>
                </label>
                <div>
                    <p className='mb-3'>{splitText("\nFind out how much you earned in a given period of time. Values ​​with and without Taxes.")}</p>
                    {/* <strong>{splitText("Facturação por Item\n")}</strong> */}
                </div>
            </div>
            {newExpenseModal && <NewExpenseModal closeNewExpenseModal={closeNewExpenseModal} />}
        </main>
    )
}

export default Expenses;