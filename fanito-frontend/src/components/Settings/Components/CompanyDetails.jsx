import React, { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import getTokenConfig from '../../../axiosconfig/config';
import axios from 'axios';
import { API_URL } from '../../../constant/config';

const CompanyDetails = ({ comdetails, isToUpdate, setIsToUpdate, isToSubmit, setIsToSubmit }) => {
    const [isFocused, setIsFocused] = useState({
        empresa: false,
        contribuinte: false,
        endereco: false,
        regimeIva: false,
        email: false,
        website: false,
        telefone: false,
        fax: false,
        cidade: false,
    });

    const [formData, setFormData] = useState({
        empresa: comdetails.companyName,
        contribuinte: comdetails.taxpayerNumber,
        endereco: comdetails.address,
        regimeIva: comdetails.vatScheme,
        email: comdetails.email,
        website: comdetails.website,
        telefone: comdetails.phone,
        fax: comdetails.fax,
        cidade: comdetails.city,
    });

    useEffect(() =>{
        if(!isToUpdate){
            setFormData({
                empresa: comdetails.companyName,
                contribuinte: comdetails.taxpayerNumber,
                endereco: comdetails.address,
                regimeIva: comdetails.vatScheme,
                email: comdetails.email,
                website: comdetails.website,
                telefone: comdetails.phone,
                fax: comdetails.fax,
                cidade: comdetails.city,
            });
        }

        if(isToSubmit){
            // console.log('first - it is');
            handleSubmitUpdate();
        }
    }, [comdetails, isToUpdate, isToSubmit])

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
        gsap.fromTo('#myCompanyDetails_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });
    }, []);

    const handleSubmitUpdate = async () =>{
        try {
            const config = getTokenConfig();
            const response = await axios.put(`${API_URL}/company/updatecompany`, formData, config);
            // console.log(response.data);
            if(response.data.message === "Company details updated successfully"){
                setIsToSubmit(false);
                setIsToUpdate(false);
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div id='myCompanyDetails_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Company details</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.empresa || formData.empresa ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Company:*
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('empresa')}
                            onBlur={() => handleBlur('empresa')}
                            onChange={(e) => handleChange('empresa', e.target.value)}
                            value={formData.empresa}
                        />
                    </div>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.contribuinte || formData.contribuinte ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Taxpayer:*
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('contribuinte')}
                            onBlur={() => handleBlur('contribuinte')}
                            onChange={(e) => handleChange('contribuinte', e.target.value)}
                            value={formData.contribuinte}
                        />
                    </div>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.endereco || formData.endereco ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Address:*
                        </label>
                        <textarea
                            type="text"
                            className={`${styleinput} max-h-[87px] min-h-[87px]`}
                            onFocus={() => handleFocus('endereco')}
                            onBlur={() => handleBlur('endereco')}
                            onChange={(e) => handleChange('endereco', e.target.value)}
                            value={formData.endereco}
                        />
                    </div>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.regimeIva || formData.regimeIva ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            VAT regime:*
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('regimeIva')}
                            onBlur={() => handleBlur('regimeIva')}
                            onChange={(e) => handleChange('regimeIva', e.target.value)}
                            value={formData.regimeIva}
                        />
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.email || formData.email ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Email:
                        </label>
                        <input
                            type="email"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('email')}
                            onBlur={() => handleBlur('email')}
                            onChange={(e) => handleChange('email', e.target.value)}
                            value={formData.email}
                        />
                    </div>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.website || formData.website ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Website:
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('website')}
                            onBlur={() => handleBlur('website')}
                            onChange={(e) => handleChange('website', e.target.value)}
                            value={formData.website}
                        />
                    </div>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.telefone || formData.telefone ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Telephone:* Zimbabwe (+263)
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('telefone')}
                            onBlur={() => handleBlur('telefone')}
                            onChange={(e) => handleChange('telefone', e.target.value)}
                            value={formData.telefone}
                        />
                    </div>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.fax || formData.fax ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            PO Box:
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('fax')}
                            onBlur={() => handleBlur('fax')}
                            onChange={(e) => handleChange('fax', e.target.value)}
                            value={formData.fax}
                        />
                    </div>
                    <div className='relative'>
                        <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.cidade || formData.cidade ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            City:*
                        </label>
                        <input
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('cidade')}
                            onBlur={() => handleBlur('cidade')}
                            onChange={(e) => handleChange('cidade', e.target.value)}
                            value={formData.cidade}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyDetails;
