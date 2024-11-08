import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState } from 'react';

const BillingDetails = ({ accountInfo }) => {
    const [isFocused, setIsFocused] = useState({
        empresa: false,
        contribuinte: false,
        email: false,
        endereco: false,
    });

    const [formData, setFormData] = useState({
        empresa: accountInfo.empresa,
        contribuinte: accountInfo.contribuinte,
        email: accountInfo.email,
        endereco: accountInfo.endereco,
    });
    
    const handleFocus = (field) => {
        setIsFocused(prevState => ({ ...prevState, [field]: true }));
    };

    const handleBlur = (field) => {
        if (!formData[field]) {
            setIsFocused(prevState => ({ ...prevState, [field]: false }));
        }
    };

    const handleChange = (field, value) => {
        setFormData(prevState => ({ ...prevState, [field]: value }));
    };

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    useGSAP(() => {
        gsap.fromTo('#myBillingDetails_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });
    }, []);
    
    return (
        <div id='myBillingDetails_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Billing Details</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-full flex flex-col gap-4'>
                    <div className='relative'>
                        <label
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['empresa']: !isFocused.empresa }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.empresa || formData.empresa ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Company:<span>*</span>
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('empresa')}
                            onBlur={() => handleBlur('empresa')}
                            onChange={(e) => handleChange('empresa', e.target.value)}
                            value={formData.empresa}
                            readOnly
                        />
                    </div>
                    <div className='relative'>
                        <label
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['contribuinte']: !isFocused.contribuinte }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.contribuinte || formData.contribuinte ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Taxpayer:<span>*</span>
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('contribuinte')}
                            onBlur={() => handleBlur('contribuinte')}
                            onChange={(e) => handleChange('contribuinte', e.target.value)}
                            value={formData.contribuinte}
                            readOnly
                        />
                    </div>
                    <div className='relative'>
                        <label
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['email']: !isFocused.email }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.email || formData.email ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Email:<span>*</span>
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('email')}
                            onBlur={() => handleBlur('email')}
                            onChange={(e) => handleChange('email', e.target.value)}
                            value={formData.email}
                            readOnly
                        />
                    </div>
                </div>
                <div className='w-full flex flex-col gap-4'>
                    <div className='relative'>
                        <label
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['endereco']: !isFocused.endereco }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.endereco || formData.endereco ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Address:<span>*</span>
                        </label>
                        <textarea
                            type="text"
                            className={`${styleinput} max-h-[87px] min-h-[87px]`}
                            onFocus={() => handleFocus('endereco')}
                            onBlur={() => handleBlur('endereco')}
                            onChange={(e) => handleChange('endereco', e.target.value)}
                            value={formData.endereco}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingDetails;