import React, { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { IoMdSettings } from 'react-icons/io';
import AccountDetails from './Components/AccountDetails';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../constant/config';
import getTokenConfig from '../../../axiosconfig/config';

function Account() {
    const [accountInfo, setAccountInfo] = useState(null);

    useEffect(() => {
        // Fetch account details from backend
        const fetchAccountInfo = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/accountplan/ge-taccount-plan`, config);
                if(response.data.error){
                    // console.log(response.data);
                    return
                }
                setAccountInfo(response.data);
            } catch (error) {
                console.error('Failed to fetch account info:', error);
            }
        };

        fetchAccountInfo();
    }, []);

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
                    <h1 className="text-3xl">{splitText("Account balance")}</h1>
                </div>
                {accountInfo && <AccountDetails accountInfo={accountInfo} />}
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <IoMdSettings />
                    <h1 className="text-sm">{splitText("Account Settings")}</h1>
                </label>
                <div className='text-sm text-gray-500 dark:text-black'>
                    <p className='mb-2 underline cursor-pointer text-gray-800 dark:text-black dark:font-medium'>{("Account balance")}</p>
                    <NavLink to='/account/billing'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Billing Info")}</p>
                    </NavLink>
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

export default Account;