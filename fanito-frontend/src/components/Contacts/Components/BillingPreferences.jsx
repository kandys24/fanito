import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState } from 'react';

const BillingPreferences = ({ formData, setFormData, setIsToUpdate }) => {
    const [isFocused, setIsFocused] = useState({
        numCopias: false,
        vencimento: false,
        idioma: false,
        meioPagamento: false,
        observacoes: false,
        moeda: false,
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
        setIsToUpdate(true);
    };

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

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
    }, []);

    return (
        <div id='myBillingPreferences_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Billing preferences</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='numCopias'  
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.numCopias || formData.numCopias ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Nº of copies:
                        </label>
                        <select
                            id='numCopias'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('numCopias')}
                            onBlur={() => handleBlur('numCopias')}
                            onChange={(e) => handleChange('numCopias', e.target.value)}
                            value={formData.numCopias}
                        >
                            <option value="Original">Original</option>
                            <option value="Em Duplicado">Em Duplicado</option>
                            <option value="Em Triplicado">Em Triplicado</option>
                        </select>
                    </div>
                    <div className='relative'>
                        <label htmlFor='vencimento' 
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.vencimento || formData.vencimento ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Due Date:
                        </label>
                        <select
                            id='vencimento'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('vencimento')}
                            onBlur={() => handleBlur('vencimento')}
                            onChange={(e) => handleChange('vencimento', e.target.value)}
                            value={formData.vencimento}
                        >
                            <option value="Pronto Pagamento">Ready to pay</option>
                            <option value="15 Dias">15 Days</option>
                            <option value="30 Dias">30 Days</option>
                            <option value="45 Dias">45 Days</option>
                            <option value="60 Dias">60 Days</option>
                            <option value="90 Dias">90 Days</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                    <div className='relative'>
                        <label htmlFor='idioma'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.idioma || formData.idioma ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Language:
                        </label>
                        <select
                            id='idioma'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('idioma')}
                            onBlur={() => handleBlur('idioma')}
                            onChange={(e) => handleChange('idioma', e.target.value)}
                            value={formData.idioma}
                        >
                            {/* <option value="Português">Português</option> */}
                            <option value="English">English</option>
                            {/* <option value="Francês">Francês</option> */}
                            {/* Add more options as needed */}
                        </select>
                    </div>
                    <div className='relative'>
                        <label htmlFor='meioPagamento'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.meioPagamento || formData.meioPagamento ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Payment method:
                        </label>
                        <select
                            id='meioPagamento'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('meioPagamento')}
                            onBlur={() => handleBlur('meioPagamento')}
                            onChange={(e) => handleChange('meioPagamento', e.target.value)}
                            value={formData.meioPagamento}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Ecocash">Ecocash</option>
                            <option value="InnBucks">InnBucks</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='observacoes'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.observacoes || formData.observacoes ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Observations:
                        </label>
                        <textarea
                            id='observacoes'
                            className={`${styleinput} max-h-[87px] min-h-[87px]`}
                            onFocus={() => handleFocus('observacoes')}
                            onBlur={() => handleBlur('observacoes')}
                            onChange={(e) => handleChange('observacoes', e.target.value)}
                            value={formData.observacoes}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='moeda'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.moeda || formData.moeda ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Currency:
                        </label>
                        <select
                            id='moeda'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('moeda')}
                            onBlur={() => handleBlur('moeda')}
                            onChange={(e) => handleChange('moeda', e.target.value)}
                            value={formData.moeda}
                        >
                            <option value="Angolan kwanza (AOA)">Angolan kwanza (AOA)</option>
                            <option value="Euro (EUR)">Euro (EUR)</option>
                            <option value="United States dollar (USD)">United States dollar (USD)</option>
                            <option value="Chinese yuan (CNY)">Chinese - yuan (CNY)</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingPreferences;