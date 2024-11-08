import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import taxExemptionCodes from '../../../constant/taxExemptionCodes';

const ItemDetails = ({ op, taxes, formData, setFormData, errors, setIsToUpdate }) => {
    const [isFocused, setIsFocused] = useState({
        codigo: false,
        descricao: false,
        unidade: false,
        retencao: false,
        precoUnitario: false,
        taxaIva: false,
        motivoIsenção: false,
        pvp: false,
        quantity: false,
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
        setIsToUpdate(true)
    };

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    useGSAP(() => {
        gsap.fromTo('#myInputNewItem_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });
    }, []);

    // formData.precoUnitario * (Number(formData.taxaIva) / 100)

    return (
        <div id='myInputNewItem_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>{op}</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='codigo'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.codigo || formData.codigo ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Code:*
                        </label>
                        <input
                            id='codigo'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('codigo')}
                            onBlur={() => handleBlur('codigo')}
                            onChange={(e) => handleChange('codigo', e.target.value)}
                            value={formData.codigo}
                            readOnly
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='descricao'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.descricao || formData.descricao ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Description:*
                        </label>
                        <textarea
                            id='descricao'
                            type="text"
                            className={`${styleinput} max-h-[87px] min-h-[87px]`}
                            onFocus={() => handleFocus('descricao')}
                            onBlur={() => handleBlur('descricao')}
                            onChange={(e) => handleChange('descricao', e.target.value)}
                            value={formData.descricao}
                        />
                        {errors.descricao && <p className="text-red-500 text-xs">{errors.descricao}</p>}
                    </div>
                    <div className='relative'>
                        <label htmlFor='unidade'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.unidade || formData.unidade ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Unit:*
                        </label>
                        <select
                            id='unidade'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('unidade')}
                            onBlur={() => handleBlur('unidade')}
                            onChange={(e) => handleChange('unidade', e.target.value)}
                            value={formData.unidade}
                        >
                            <option value="Unidade">Unit</option>
                            <option value="Serviço">Service</option>
                        </select>
                    </div>
                    <div className='relative'>
                        <label htmlFor='retencao'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.retencao || formData.retencao ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Retention:
                        </label>
                        <select
                            id='retencao'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('retencao')}
                            onBlur={() => handleBlur('retencao')}
                            onChange={(e) => handleChange('retencao', e.target.value)}
                            value={formData.retencao}
                        >
                            <option value="Aplicar">Apply</option>
                            <option value="Não Aplicar">Not apply</option>
                        </select>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='precoUnitario'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.precoUnitario || formData.precoUnitario ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Unit Price:*
                        </label>
                        <input
                            id='precoUnitario'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('precoUnitario')}
                            onBlur={() => handleBlur('precoUnitario')}
                            onChange={(e) => handleChange('precoUnitario', e.target.value)}
                            value={formData.precoUnitario}
                        />
                        {errors.precoUnitario && <p className="text-red-500 text-xs">{errors.precoUnitario}</p>}
                    </div>
                    <div className='relative'>
                        <label htmlFor='taxaIva'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.taxaIva || formData.taxaIva ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Tax/VAT:*
                        </label>
                        <select
                            id='taxaIva'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('taxaIva')}
                            onBlur={() => handleBlur('taxaIva')}
                            onChange={(e) => handleChange('taxaIva', e.target.value)}
                            value={formData.taxaIva}
                        >
                            {/* <option value="14.00% - Taxa14">14.00% - Taxa14</option>
                            <option value="0.00% - Isento">0.00% - Isento</option> */}
                            {taxes && taxes.map((tax, index)=><option key={index} value={tax.value.toFixed(2)}>{`${tax.value.toFixed(2)}% - ${tax.name}`}</option>)}
                        </select>
                        {errors.taxaIva && <p className="text-red-500 text-xs">{errors.taxaIva}</p>}
                    </div>
                    {Number(formData.taxaIva) === 0 && <div className='relative'>
                        <label htmlFor='motivoIsenção'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.motivoIsenção || formData.motivoIsenção ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Exemption reason:
                        </label>
                        <select
                            id='motivoIsenção'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('motivoIsenção')}
                            onBlur={() => handleBlur('motivoIsenção')}
                            onChange={(e) => handleChange('motivoIsenção', e.target.value)}
                            value={formData.motivoIsenção}
                        >
                            <option value="0">Select an option</option>
                            {taxExemptionCodes && taxExemptionCodes.map((item, index) =>
                                <option key={index} value={item.name}>{item.name}</option>
                            )}
                        </select>
                        {errors.motivoIsenção && <p className="text-red-500 text-xs">{errors.motivoIsenção}</p>}
                    </div>}
                    <div className='relative'>
                        <label htmlFor='pvp'
                            onClick={() => handleFocus('pvp')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.pvp || formData.pvp ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            RRR:
                        </label>
                        <input
                            id='pvp'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('pvp')}
                            onBlur={() => handleBlur('pvp')}
                            onChange={(e) => handleChange('pvp', e.target.value)}
                            value={formData.pvp}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='quantity'
                            onClick={() => handleFocus('quantity')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.quantity || formData.quantity ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Quantity:*
                        </label>
                        <input
                            id='quantity'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('quantity')}
                            onBlur={() => handleBlur('quantity')}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                            value={formData.quantity}
                        />
                        {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemDetails;