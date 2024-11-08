import React, { useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { IoMdSettings } from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import TaxesDetails from './Components/TaxesDetails';
import axios from 'axios';
import RightButton from '../Buttons/RightButton';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';

const TaxSettings = () => {
    const [taxes, setTaxes] = useState([]);
    const [isToUpdate, setIsToUpdate] = useState(false);

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

    useEffect(() => {
        // Fetch tax data from the API
        const fetchTaxes = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/taxes/get-taxes`, config);
                setTaxes(response.data.taxes);
            } catch (error) {
                console.error('Error fetching taxes:', error);
            }
        };

        if(!isToUpdate){
            fetchTaxes();
        }
    }, [isToUpdate]);

    const handleSave = async () => {
        try {
            const config = getTokenConfig();
            const response = await axios.post(`${API_URL}/taxes/update-taxes`, taxes, config);
            setIsToUpdate(false);
            alert('Tax settings saved successfully');
        } catch (error) {
            console.error('Error saving taxes:', error);
            alert('Failed to save tax settings');
        }
    };

    return (
        <main className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl">
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Company details")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                <TaxesDetails taxes={taxes} setTaxes={setTaxes} isToUpdate={isToUpdate} setIsToUpdate={setIsToUpdate} />
                {isToUpdate &&<div className='flex justify-end items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                     <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={()=>setIsToUpdate(false)} />
                        <RightButton name={'Save'} btnStyle={'text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900'} onClick={handleSave} />
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
                    <NavLink to='/settings/customization'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>
                            {("Document customization")}
                        </p>
                    </NavLink>
                    <p className='mb-2 underline cursor-pointer text-gray-800 dark:text-black dark:font-medium'>{("Taxes/VAT")}</p>
                    <NavLink to='/settings/series'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Series")}</p>
                    </NavLink>
                </div>
            </div>
        </main>
    );
};

export default TaxSettings;
