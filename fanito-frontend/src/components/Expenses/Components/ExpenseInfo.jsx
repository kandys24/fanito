import React from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import setCurrencyFormat from '../../../constant/setCurrencyFormat';
import formatDate from '../../../constant/formatDate';

const ExpenseInfo = ({ expenseDetails }) => {

    useGSAP(() => {
        gsap.fromTo('#myItemInfo_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });

        gsap.fromTo('#myItemInfo_h1_semibold', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
            marginLeft: 2,
        });
    }, []);

    return (
        <div id='myItemInfo_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Expense Details</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Code:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{expenseDetails.expense_code}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Description:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{expenseDetails.description}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Unit:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{expenseDetails.amount}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Observation:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{expenseDetails.obs}</h1>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Unit Price:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{setCurrencyFormat(expenseDetails.amount)}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Payment Method:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{expenseDetails.payment_method}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Date:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{formatDate(expenseDetails.created_at)}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Status:</h2>
                        <h1 id='myItemInfo_h1_semibold' className={`text-base font-semibold ${expenseDetails.status === 'final' ? 'text-green-600' : 'text-red-600'}`}>{expenseDetails.status}</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExpenseInfo;