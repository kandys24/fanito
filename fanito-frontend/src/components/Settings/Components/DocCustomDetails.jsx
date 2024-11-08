import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState } from 'react';

const DocCustomDetails = ({ formData, updateFormData, setIsToUpdate }) => {
    const [isFocused, setIsFocused] = useState({
        rodape: false,
        observações: false,
        bankAccounts: formData.bankAccounts.map(() => ({
            bankName: false,
            accountNumber: false,
            iban: false,
        })),
    });

    const handleFocus = (field, index = null) => {
        if (index !== null) {
            // Handle focus for bank account fields
            setIsFocused(prevState => ({
                ...prevState,
                bankAccounts: prevState.bankAccounts.map((focus, i) =>
                    i === index ? { ...focus, [field]: true } : focus
                ),
            }));
        } else {
            // Handle focus for other fields
            setIsFocused(prevState => ({ ...prevState, [field]: true }));
        }
    };

    const handleBlur = (field, index = null) => {
        if (index !== null) {
            // Handle blur for bank account fields
            setIsFocused(prevState => ({
                ...prevState,
                bankAccounts: prevState.bankAccounts.map((focus, i) =>
                    i === index && !formData.bankAccounts[i][field] ? { ...focus, [field]: false } : focus
                ),
            }));
        } else {
            // Handle blur for other fields
            if (!formData[field]) {
                setIsFocused(prevState => ({ ...prevState, [field]: false }));
            }
        }
    };

    const handleChange = (field, value, index = null) => {
        if (index !== null) {
            // Update specific bank account field
            updateFormData({
                bankAccounts: formData.bankAccounts.map((acc, i) =>
                    i === index ? { ...acc, [field]: value } : acc
                ),
            });
        } else {
            // Update other fields
            updateFormData({ [field]: value });
        }
        setIsToUpdate(true);
    };

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    const styleSelect = `py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    useGSAP(() => {
        gsap.fromTo('#myDocCustomDetails_main', {
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
        <>
            <div id='myDocCustomDetails_main' className="mt-5 bg-white py-5 px-5 dark:bg-[#0E0E0E] rounded-xl shadow">
                <h2 className="text-lg mb-6">Pre-populated fields in documents</h2>
                <div className='relative mb-4'>
                    <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                        ${isFocused.observações || formData.observations ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                        Observations:
                    </label>
                    <textarea
                        type="text"
                        className={`${styleinput} max-h-[87px] min-h-[87px]`}
                        onFocus={() => handleFocus('observações')}
                        onBlur={() => handleBlur('observações')}
                        onChange={(e) => handleChange('observations', e.target.value)}
                        value={formData.observations}
                    />
                    <p className="text-xs text-gray-500">Example: Call the finance department after receiving this invoice.</p>
                </div>
                <div className='relative'>
                    <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                        ${isFocused.rodape || formData.footer ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                        Rodapé:*
                    </label>
                    <input
                        type="text"
                        className={`${styleinput}`}
                        onFocus={() => handleFocus('rodape')}
                        onBlur={() => handleBlur('rodape')}
                        onChange={(e) => handleChange('footer', e.target.value)}
                        value={formData.footer}
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: City Example, nº9 1500-000 Harare | Tel. 21 000 00 00 | www.companyexample.com</p>
                </div>
            </div>
            <div className="mt-5 bg-white py-5 px-5 dark:bg-[#0E0E0E] rounded-xl shadow">
                <h2 className="text-lg mb-4">Bank details in documents</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Include your bank details in your documents.
                </p>

                {formData.bankAccounts.map((account, index) => (
                    <div className="mb-4" key={index}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select account:</label>
                        <div className='flex gap-2'>
                            <select 
                                value={account.bankName} 
                                onChange={(e) => handleChange('bankName', e.target.value, index)} 
                                className={styleSelect}
                                onFocus={() => handleFocus('bankName', index)}
                                onBlur={() => handleBlur('bankName', index)}
                            >
                                <option>FBC Bank</option>
                                <option>ZB BAI</option>
                                <option>ZBC BFA</option>
                            </select>
                            <div className='relative flex-1'>
                                <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                    ${isFocused.bankAccounts[index].accountNumber || account.accountNumber ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                    Account number:
                                </label>
                                <input 
                                    type="text" 
                                    value={account.accountNumber} 
                                    onChange={(e) => handleChange('accountNumber', e.target.value, index)} 
                                    className={styleinput}
                                    onFocus={() => handleFocus('accountNumber', index)}
                                    onBlur={() => handleBlur('accountNumber', index)}
                                />
                            </div>
                            <div className='relative flex-1'>
                                <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                    ${isFocused.bankAccounts[index].iban || account.iban ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                    Iban:
                                </label>
                                <input 
                                    type="text" 
                                    value={account.iban} 
                                    onChange={(e) => handleChange('iban', e.target.value, index)} 
                                    className={styleinput}
                                    onFocus={() => handleFocus('iban', index)}
                                    onBlur={() => handleBlur('iban', index)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default DocCustomDetails;
