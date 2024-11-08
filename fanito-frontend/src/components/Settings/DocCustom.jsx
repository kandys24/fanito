import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { IoMdSettings } from 'react-icons/io';
import DocCustomDetails from './Components/DocCustomDetails';
import { NavLink } from 'react-router-dom';
import CustomLogo from './Components/CustomLogo';
import RightButton from '../Buttons/RightButton';
import { API_URL } from '../../constant/config';
import getTokenConfig from '../../axiosconfig/config';

const DocCustom = () => {
    const [formData, setFormData] = useState({
        logo: null,
        logoUrl: '',  // New state to hold the existing logo URL
        observations: '',
        footer: '',
        bankAccounts: [
            { bankName: 'Bank BIC', accountNumber: '', iban: '' },
            { bankName: 'Bank BAI', accountNumber: '', iban: '' },
        ],
    });
    const [isToUpdate, setIsToUpdate] = useState(false);

    const fetchCustomizationData = async () => {
        try {
            const config = getTokenConfig();
            const response = await axios.get(`${API_URL}/doccustom/get-doc-customization`, config);
            const { customization, bankAccounts } = response.data;

            // console.log(bankAccounts)

            setFormData({
                logo: null,
                logoUrl: customization?.logoUrl ? API_URL+customization.logoUrl : '',  // Set the existing logo URL
                observations: customization?.observations || '',
                footer: customization?.footer || '',
                bankAccounts: bankAccounts.length ? bankAccounts : [
                    { bankName: 'Conta BIC', accountNumber: '', iban: '' },
                    { bankName: 'Conta BAI', accountNumber: '', iban: '' },
                ],
            });
        } catch (error) {
            console.error('Error fetching customization data', error);
        }
    };

    useEffect(() => {

        if(!isToUpdate){
            fetchCustomizationData();
            // console.log('first')
        }
    }, [isToUpdate]);

    const handleSubmit = async () => {
        // Ensure that the footer and at least one of logo or logoUrl is provided
        if (!formData.footer) {
            alert('Please provide a footer.');
            return;
        }

        if (!formData.logo && !formData.logoUrl) {
            alert('Please provide logo.');
            return;
        }

        const data = new FormData();
        if (formData.logo) data.append('logo', formData.logo);
        data.append('observations', formData.observations);
        data.append('footer', formData.footer);
        data.append('bankAccounts', JSON.stringify(formData.bankAccounts));

        try {
            const config = getTokenConfig();
            const response = await axios.post(`${API_URL}/doccustom/doc-customization`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...config.headers
                },
            });
            if(response.data.message){
                setIsToUpdate(false);
                // alert(response.data.message);
            }
        } catch (error) {
            console.error('There was an error!', error);
            // alert('Error saving customization');
        }
    };

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const splitText = (text) => {
        return text.split("").map((char, index) => (
            <span key={index} className="letter">
                {char}
            </span>
        ));
    };

    useGSAP(() => {
        gsap.fromTo(
            '.letter', 
            {
                opacity: 0,
                y: 20,
            }, 
            {
                opacity: 1,
                y: 0,
                delay: 0.5,
                stagger: 0.05,
            }
        );
    }, []);

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Company details")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                <CustomLogo 
                    logoUrl={formData.logoUrl}
                    updateFormData={updateFormData}
                    isToUpdate={isToUpdate}
                    setIsToUpdate={setIsToUpdate}
                />
                <DocCustomDetails 
                    formData={formData} 
                    updateFormData={updateFormData}
                    setIsToUpdate={setIsToUpdate}
                />
                {isToUpdate &&
                <div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div></div>
                    <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={() =>setIsToUpdate(false)} />
                        <RightButton name={'Save'} btnStyle={'text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900'} onClick={handleSubmit} />
                    </div>
                </div>}
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <IoMdSettings />
                    <h1 className="text-sm">{splitText("Settings")}</h1>
                </label>
                <div className='text-sm text-gray-500 dark:text-black'>
                    <NavLink to='/settings'>
                        <p className='mb-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Company details")}</p>
                    </NavLink>
                    <p className='my-2 underline cursor-pointer text-gray-800 dark:text-black dark:font-medium'>{("Document customization")}</p>
                    <NavLink to='/settings/taxes'>
                        <p className='mb-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{"Taxes/VAT"}</p>
                    </NavLink>
                    <NavLink to='/settings/series'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{"Series"}</p>
                    </NavLink>
                </div>
            </div>
        </main>
    )
}

export default DocCustom;
