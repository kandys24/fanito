import React from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const AccountDetails = ({ accountInfo }) => {
    // const accountInfo = {
    //     plan: 'PLUS',
    //     balancePeriod: '16 de Julho de 2024 a 19 de Outubro de 2024',
    //     planDetails: {
    //         name: 'PLUS',
    //         price: '22.260,00 Kz / trimestre',
    //         remainingDays: '58 dia(s)',
    //         expiryDate: '19 de Outubro de 2024',
    //     },
    //     usage: {
    //         documents: '256 / 1710',
    //         users: '2 / 8',
    //     }
    // };

    useGSAP(() => {
        gsap.fromTo('#accountDetails_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });

        gsap.fromTo('#accountDetails_h1_semibold', {
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
        <div id='accountDetails_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Account Balance</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Plan:</h2>
                        <h1 id='accountDetails_h1_semibold' className='text-base font-semibold'>{accountInfo.plan}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Balance Period:</h2>
                        <h1 id='accountDetails_h1_semibold' className='text-base font-semibold'>{accountInfo.balancePeriod}</h1>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Expires in:</h2>
                        <h1 id='accountDetails_h1_semibold' className='text-base font-semibold'>{accountInfo.planDetails.expiryDate}</h1>
                    </div>
                </div>
            </div>
            <div className='mt-6'>
                <div className='border-b border-black pb-2'>
                    <h1 className='text-lg'>Conta</h1>
                </div>
                <div className='flex justify-between gap-12 mt-5'>
                    <div className='w-1/2 flex flex-col gap-4'>
                        <div>
                            <h2 className='text-xs text-gray-700 dark:text-gray-300'>Plan:</h2>
                            <h1 id='accountDetails_h1_semibold' className='text-base font-semibold'>{accountInfo.planDetails.name} ({accountInfo.planDetails.price})</h1>
                        </div>
                        <div>
                            <h2 className='text-xs text-gray-700 dark:text-gray-300'>Balance:</h2>
                            <h1 id='accountDetails_h1_semibold' className='text-base font-semibold'>{accountInfo.planDetails.remainingDays}</h1>
                        </div>
                    </div>
                    <div className='w-1/2 flex flex-col gap-4'>
                        <div>
                            <h2 className='text-xs text-gray-700 dark:text-gray-300'>Documents:</h2>
                            <h1 id='accountDetails_h1_semibold' className='text-base font-semibold'>{accountInfo.usage.documents}</h1>
                        </div>
                        <div>
                            <h2 className='text-xs text-gray-700 dark:text-gray-300'>Users:</h2>
                            <h1 id='accountDetails_h1_semibold' className='text-base font-semibold'>{accountInfo.usage.users}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountDetails;
