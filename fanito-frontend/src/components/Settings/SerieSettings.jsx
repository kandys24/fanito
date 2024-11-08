import React, { useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { IoMdSettings } from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import SerieDetails from './Components/SerieDetails';
import axios from 'axios';
import RightButton from '../Buttons/RightButton';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';

const SerieSettings = () => {
    const [series, setSeries] = useState([]);
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
        const fetchSeries = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/series/get-series`, config);
                setSeries(response.data.series);
            } catch (error) {
                console.error('Error fetching series:', error);
            }
        };

        if(!isToUpdate){
            fetchSeries();
        }
    }, [isToUpdate]);

    const handleSave = async () => {
        try {
            const config = getTokenConfig();
            const response = await axios.post(`${API_URL}/series/update-series`, series, config);
            setIsToUpdate(false);
            alert('Series settings saved successfully');
        } catch (error) {
            console.error('Error saving series:', error);
            alert('Failed to save series settings');
        }
    };

    return (
        <main className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl">
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Document Series")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                <SerieDetails series={series} setSeries={setSeries} setIsToUpdate={setIsToUpdate} />
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
                    <NavLink to='/settings/taxes'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Taxes/VAT")}</p>
                    </NavLink>
                    <p className='mb-2 underline cursor-pointer text-gray-800 dark:text-black dark:font-medium'>{("Series")}</p>
                </div>
            </div>
        </main>
    );
};

export default SerieSettings;