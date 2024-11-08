import React from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';


const ItemInfo = ({ itemDetails }) => {

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

    const setCurrencyFormat = (amount) => {
        const pamount = amount;
        const numberOfDecimals = 2; 
        const formattedValue = pamount.toLocaleString("pt-ao", {
            style: "currency",
            currency: "AOA",
            minimumFractionDigits: numberOfDecimals,
            maximumFractionDigits: numberOfDecimals,
        });
    
        return formattedValue;
    };

    return (
        <div id='myItemInfo_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Item Details</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Code:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{itemDetails.code}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Description:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{itemDetails.description}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Unit:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{itemDetails.unit}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Retention:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{itemDetails.retention}</h1>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Unit Price:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{setCurrencyFormat(itemDetails.unit_price)}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Tax/VAT:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{itemDetails.tax_rate.toFixed(2)}%</h1>
                    </div>
                    {itemDetails.tax_rate === 0 && <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Exemption reason:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{itemDetails.exemption_reason}</h1>
                    </div>}
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>RRR:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{setCurrencyFormat(itemDetails.pvp || (itemDetails.unit_price * (1 + itemDetails.tax_rate/100)))}</h1>
                    </div>
                    <div>
                        <h2 className='text-xs text-gray-700 dark:text-gray-300'>Quantity:</h2>
                        <h1 id='myItemInfo_h1_semibold' className='text-base font-semibold'>{itemDetails.quantity}</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemInfo;