import React, { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { IoMdSettings } from 'react-icons/io';
import BillingDetails from './Components/BillingDetails';
import { NavLink } from 'react-router-dom';
import LeftButton from '../../Buttons/LeftButton';
import getTokenConfig from '../../../axiosconfig/config';
import axios from 'axios';
import { API_URL } from '../../../constant/config';

const AccountBilling = () => {
    const [accountInfo, setAccountInfo] = useState(null);
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
        // Fetch account details from backend
        const fetchAccountInfo = async () => {
            try {
                const config = getTokenConfig();
            
                const response = await axios.get(`${API_URL}/company/getcompany`, config);
                // console.log(response.data.companyDetails);
                const arrayDetails = response.data.companyDetails ? response.data.companyDetails : null
                if(arrayDetails)
                    setAccountInfo({
                        empresa: arrayDetails.companyName,
                        contribuinte: arrayDetails.taxpayerNumber,
                        email: arrayDetails.email,
                        endereco: arrayDetails.address,
                    });
            } catch (error) {
                console.error('Failed to fetch account info:', error);
            }
        };

        fetchAccountInfo();
    }, []);

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Billing Info")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                {accountInfo && <BillingDetails accountInfo={accountInfo} />}
                {isToUpdate &&<div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div></div>
                    <div className='flex gap-5'>
                        <LeftButton name={'Cancel'} />
                        <LeftButton name={'Save'} btnStyle={'text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900'} />
                    </div>
                </div>}
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <IoMdSettings />
                    <h1 className="text-sm">{splitText("Account Settings")}</h1>
                </label>
                <div className='text-sm text-gray-500 dark:text-black'>
                    <NavLink to='/account'>
                        <p className='mb-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Account balance")}</p>
                    </NavLink>
                    <p className='my-2 underline cursor-pointer text-gray-800 dark:text-black dark:font-medium'>{("Billing Info")}</p>
                    <NavLink to='/account/profile'>
                        <p className='mb-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("My profile")}</p>
                    </NavLink>
                    <NavLink to='/account/users'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Manage users")}</p>
                    </NavLink>
                </div>
            </div>
        </main>
    )
}

export default AccountBilling;