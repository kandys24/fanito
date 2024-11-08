import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CompanyDetails from './Components/CompanyDetails';
import { IoMdSettings } from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';
import RightButton from '../Buttons/RightButton';

const Settings = () => {
    const [comdetails, setComDetails] = useState(null);
    const [isToUpdate, setIsToUpdate] = useState(false);
    const [isToSubmit, setIsToSubmit] = useState(false);
    const hasFetched = useRef(false); 

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

    
    const getDetails = async() =>{

        try {
            const config = getTokenConfig();
        
            const response = await axios.get(`${API_URL}/company/getcompany`, config);
            // console.log(response.data.companyDetails);
            const arrayDetails = response.data.companyDetails ? response.data.companyDetails : null
            setComDetails(arrayDetails);
            
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{

        if (!hasFetched.current) {
            getDetails();
            hasFetched.current = true; // Mark as fetched
        }

        if(isToSubmit){
            hasFetched.current = false;
        }

    },[isToSubmit, hasFetched]);

    const handleCancel = () =>{
        setIsToUpdate(false);
    }

    const handleSubmit = () =>{
        setIsToSubmit(true)
    }

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
                {!comdetails 
                    ?<div className='w-full flex justify-center items-center mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                        LOADING...
                    </div>
                    :<CompanyDetails 
                        comdetails={comdetails} 
                        isToUpdate={isToUpdate} 
                        setIsToUpdate={setIsToUpdate}
                        isToSubmit={isToSubmit}
                        setIsToSubmit={setIsToSubmit}
                    />
                }
                {isToUpdate &&<div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div></div>
                    <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={handleCancel} />
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
                    <p className='mb-2 underline cursor-pointer text-gray-800 dark:text-black dark:font-medium'>{("Company details")}</p>
                    <NavLink to='/settings/customization'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>
                            {("Document customization")}
                        </p>
                    </NavLink>
                    <NavLink to='/settings/taxes'>
                        <p className='mb-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Taxes/VAT")}</p>
                    </NavLink>
                    <NavLink to='/settings/series'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Series")}</p>
                    </NavLink>
                    {/* <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Template de mensagens")}</p> */}
                </div>
            </div>
        </main>
    )
}

export default Settings;