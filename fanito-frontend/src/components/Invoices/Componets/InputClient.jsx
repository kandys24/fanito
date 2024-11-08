import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useEffect, useState } from 'react';
import { IoIosClose } from "react-icons/io";

const InputClient = ({ handEmptyUser, client, setClient, isToCheck }) => {
    const [isFocused, setIsFocused] = useState({
        name: false,
        contribuinte: false,
        email: false,
        endereco: false,
        caixaPostal: false,
        cidade: false,
    });

    const [formData, setFormData] = useState({
        name: client.name || '',
        contribuinte: client.document_number || '',
        email: client.email || '',
        endereco: client.address || '',
        caixaPostal: client.postal_box || '',
        cidade: client.city || ''
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

    useEffect(() =>{
        if(isToCheck){
            if(formData.name){
                setClient(prevState => ({
                    ...prevState,
                    name: formData.name || '',
                    document_number: formData.contribuinte || '',
                    email: formData.email || '',
                    address: formData.endereco || '',
                    postal_box: formData.caixaPostal || '',
                    city: formData.cidade || ''
                }))
            }
        }
    }, [isToCheck])

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    useGSAP(() => {
        gsap.fromTo('#myInputClient_main', {
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
        <div id='myInputClient_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Client Details</h1>
                <button 
                    className='py-1 px-2 rounded-lg shadow transition-all duration-200 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-90 active:shadow-inner'
                    onClick={handEmptyUser}
                >
                    <IoIosClose size={30} />
                </button>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='flex flex-1 flex-col gap-4'>
                        <div className='relative'>
                            <label htmlFor='name'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.name || formData.name ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Name:
                            </label>
                            <input id='name'
                                type="text"
                                className={`${styleinput}`}
                                onFocus={() => handleFocus('name')}
                                onBlur={() => handleBlur('name')}
                                onChange={(e) => handleChange('name', e.target.value)}
                                value={formData.name}
                                disabled={!!client.name}
                            />
                        </div>
                        <div className='relative'>
                            <label htmlFor='contribuinte'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.contribuinte || formData.contribuinte ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Taxpayer:
                            </label>
                            <input id='contribuinte'
                                type="text"
                                className={`${styleinput}`}
                                onFocus={() => handleFocus('contribuinte')}
                                onBlur={() => handleBlur('contribuinte')}
                                onChange={(e) => handleChange('contribuinte', e.target.value)}
                                value={formData.contribuinte}
                                disabled={!!client.name}
                            />
                        </div>
                        <div className='relative'>
                            <label htmlFor='email'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.email || formData.email ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Email:
                            </label>
                            <input id='email'
                                type="text"
                                className={`${styleinput}`}
                                onFocus={() => handleFocus('email')}
                                onBlur={() => handleBlur('email')}
                                onChange={(e) => handleChange('email', e.target.value)}
                                value={formData.email}
                                disabled={!!client.name}
                            />
                        </div>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='endereco'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.endereco || formData.endereco ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Address:
                        </label>
                        <input id='endereco'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('endereco')}
                            onBlur={() => handleBlur('endereco')}
                            onChange={(e) => handleChange('endereco', e.target.value)}
                            value={formData.endereco}
                            disabled={!!client.name}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='caixaPostal'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.caixaPostal || formData.caixaPostal ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            PO Box:
                        </label>
                        <input id='caixaPostal'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('caixaPostal')}
                            onBlur={() => handleBlur('caixaPostal')}
                            onChange={(e) => handleChange('caixaPostal', e.target.value)}
                            value={formData.caixaPostal}
                            disabled={!!client.name}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='cidade'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.cidade || formData.cidade ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            City:
                        </label>
                        <input
                            id='cidade'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('cidade')}
                            onBlur={() => handleBlur('cidade')}
                            onChange={(e) => handleChange('cidade', e.target.value)}
                            value={formData.cidade}
                            disabled={!!client.name}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputClient;
