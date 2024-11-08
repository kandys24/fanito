import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState } from 'react';
import angolaProvinces from '../../../constant/angolaProvinces';

const ClientDetails = ({ formData, setFormData, errors, setIsToUpdate  }) => {
    const [isFocused, setIsFocused] = useState({
        tipo: false,
        name: false,
        tipoDoc: false,
        numeroDoc: false,
        endereco: false,
        caixaPostal: false,
        website: false,
        pais: false,
        cidade: false,
        email: false,
        telefone: false,
        telemovel: false,
        fax: false,
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
        gsap.fromTo('#myClientDetails_main', {
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
        <div id='myClientDetails_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Client Details</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='name'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['name']: !isFocused.name }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.name || formData.name ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Name:
                        </label>
                        <input
                            id='name'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('name')}
                            onBlur={() => handleBlur('name')}
                            onChange={(e) => handleChange('name', e.target.value)}
                            value={formData.name}
                        />
                        {errors.name && <span className='text-red-500 text-sm'>{errors.name}</span>}
                    </div>
                    {<div className='relative'>
                        <label htmlFor='tipo'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['tipo']: !isFocused.name }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.tipo || formData.tipo ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Type:
                        </label>
                        <select
                            id='tipo'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('tipo')}
                            onBlur={() => handleBlur('tipo')}
                            onChange={(e) => handleChange('tipo', e.target.value)}
                            value={formData.tipo}
                        >
                            <option value="Normal">Normal</option>
                            <option value="Autofacturação">Self-billing</option>
                        </select>
                    </div>}
                    {formData.tipo === 'Autofacturação' && <div className='relative'>
                        <label htmlFor='tipoDoc'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['tipoDoc']: !isFocused.tipoDoc }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.tipoDoc || formData.tipoDoc ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Doc type:
                        </label>
                        <select
                            id='tipoDoc'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('tipoDoc')}
                            onBlur={() => handleBlur('tipoDoc')}
                            onChange={(e) => handleChange('tipoDoc', e.target.value)}
                            value={formData.tipoDoc}
                        >
                            <option value="Contribuinte">Tax identification number</option>
                            <option value="Bilhete de identidade">Identity card</option>
                            <option value="Cartão de residente">Resident card</option>
                        </select>
                    </div>}
                    <div className='relative'>
                        <label htmlFor='numeroDoc'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['numeroDoc']: !isFocused.numeroDoc }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.numeroDoc || formData.numeroDoc ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            {formData.tipo !== 'Autofacturação' ? 'Tax ID' : 'Doc number:'}
                        </label>
                        <input
                            id='numeroDoc'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('numeroDoc')}
                            onBlur={() => handleBlur('numeroDoc')}
                            onChange={(e) => handleChange('numeroDoc', e.target.value)}
                            value={formData.numeroDoc}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='endereco'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['endereco']: !isFocused.endereco }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.endereco || formData.endereco ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Address:
                        </label>
                        <textarea
                            id='endereco'
                            type="text"
                            className={`${styleinput} max-h-[87px] min-h-[87px]`}
                            onFocus={() => handleFocus('endereco')}
                            onBlur={() => handleBlur('endereco')}
                            onChange={(e) => handleChange('endereco', e.target.value)}
                            value={formData.endereco}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='caixaPostal'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['caixaPostal']: !isFocused.caixaPostal }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.caixaPostal || formData.caixaPostal ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            PO Box:
                        </label>
                        <input
                            id='caixaPostal'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('caixaPostal')}
                            onBlur={() => handleBlur('caixaPostal')}
                            onChange={(e) => handleChange('caixaPostal', e.target.value)}
                            value={formData.caixaPostal}
                        />
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='pais'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['pais']: !isFocused.pais }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.pais || formData.pais ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Country:
                        </label>
                        <input
                            id='pais'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('pais')}
                            onBlur={() => handleBlur('pais')}
                            onChange={(e) => handleChange('pais', e.target.value)}
                            value={formData.pais}
                            readOnly
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='cidade'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['cidade']: !isFocused.cidade }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.cidade || formData.cidade ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            City:
                        </label>
                        <select
                            id='cidade'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('cidade')}
                            onBlur={() => handleBlur('cidade')}
                            onChange={(e) => handleChange('cidade', e.target.value)}
                            value={formData.cidade}
                        >
                            {angolaProvinces && 
                                angolaProvinces.map((item, i)=><option key={i} value={item.name}>{item.name}</option>)
                            }
                        </select>
                    </div>
                    <div className='relative'>
                        <label htmlFor='email'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['email']: !isFocused.email }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.email || formData.email ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Email:
                        </label>
                        <input
                            id='email'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('email')}
                            onBlur={() => handleBlur('email')}
                            onChange={(e) => handleChange('email', e.target.value)}
                            value={formData.email}
                        />
                        {errors.email && <span className='text-red-500 text-sm'>{errors.email}</span>}
                    </div>
                    <div className='relative'>
                        <label htmlFor='telefone'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['telefone']: !isFocused.telefone }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.telefone || formData.telefone ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Telephone: Zimbabwe (+263)
                        </label>
                        <input
                            id='telefone'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('telefone')}
                            onBlur={() => handleBlur('telefone')}
                            onChange={(e) => handleChange('telefone', e.target.value)}
                            value={formData.telefone}
                            placeholder=""
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='telemovel'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['telemovel']: !isFocused.telemovel }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.telemovel || formData.telemovel ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Mobile: Zimbabwe (+263)
                        </label>
                        <input
                            id='telemovel'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('telemovel')}
                            onBlur={() => handleBlur('telemovel')}
                            onChange={(e) => handleChange('telemovel', e.target.value)}
                            value={formData.telemovel}
                            placeholder=""
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='fax'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['fax']: !isFocused.fax }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.fax || formData.fax ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Fax:
                        </label>
                        <input
                            id='fax'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('fax')}
                            onBlur={() => handleBlur('fax')}
                            onChange={(e) => handleChange('fax', e.target.value)}
                            value={formData.fax}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='website'
                            onClick={()=>setIsFocused(prevState => ({ ...prevState, ['website']: !isFocused.website }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.website || formData.website ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Website:
                        </label>
                        <input
                            id='website'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('website')}
                            onBlur={() => handleBlur('website')}
                            onChange={(e) => handleChange('website', e.target.value)}
                            value={formData.website}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientDetails;