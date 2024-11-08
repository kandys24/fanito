import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React from 'react';

const MoreDetails = ({ billingPreferences }) => {
    
    useGSAP(() => {
        gsap.fromTo('#myBillingPreferences_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });

        gsap.fromTo('#mainDetails_h1_semibold', {
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
        <div id='myBillingPreferences_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Billing preferences</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Nº of copies:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{billingPreferences.copies}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Due Date:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{billingPreferences.payment_due}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Language:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{billingPreferences.language}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Payment method:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{billingPreferences.payment_method}</h1>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Observations:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{billingPreferences.observations}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Currency:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{billingPreferences.currency}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MoreDetails;