import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React from 'react';

const MainDetails = ({ contactDetails }) => {

    useGSAP(() => {
        gsap.fromTo('#myClientDetails_main', {
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
        <div id='myClientDetails_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Client Details</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Name:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.name}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Type:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.type}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Doc. type:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.document_type}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Doc. Number:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.document_number}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Address:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.address}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>PO Box:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.postal_box}</h1>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Country:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.country}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>City:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.city}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Email:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.email}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Telephone: Zimbabwe (+263)</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.phone}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Mobile: <span className='text-sm'>Zimbabwe (+263)</span></h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.mobile}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Fax/VAT:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.fax}</h1>
                    </div>
                    <div className=''>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Website:</h2>
                        <h1 id='mainDetails_h1_semibold' className='text-base font-semibold'>{contactDetails.website}</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainDetails;