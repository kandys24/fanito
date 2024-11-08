import React, { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { IoMdSettings } from 'react-icons/io';
import { NavLink, useNavigate } from 'react-router-dom';
import ProfileDetails from './Components/ProfileDetails';
import getTokenConfig from '../../../axiosconfig/config';
import { API_URL } from '../../../constant/config';
import axios from 'axios';
import RightButton from '../../Buttons/RightButton';

const Profile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isToUpdate, setIsToUpdate] = useState(false);
    const [errors, setErrors] = useState({});

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
        const fetchUsers = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/users/ge-tuser`, config);
                // console.log(response.data.user[0].email);
                setFormData({
                    email: response.data.user[0].email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        if(!isToUpdate){
            fetchUsers();
            setErrors({})
        }
    }, [isToUpdate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.currentPassword) newErrors.currentPassword = 'Atual Password é obrigatório.';
        if (!formData.newPassword) newErrors.newPassword = 'Nova Password é obrigatório.';
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Palavras passe não coincidem.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSetNewPass = async () =>{

        if (!validateForm()) return;

        try {
            const config = getTokenConfig();
            const response = await axios.post(`${API_URL}/users/resetp-assword`, formData, config);
            if(response.data.message === 'Current Password incorrect'){
                setErrors({ ...errors, currentPassword: 'Atual Password incorreta.' });
                return;
            }
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Password reset error:', error);
        }
    }

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("My profile")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                {!formData.email 
                    ?<div className='w-full flex justify-center items-center mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                        LOADING...
                    </div>
                    :<ProfileDetails 
                        formData={formData} 
                        setFormData={setFormData} 
                        setIsToUpdate={setIsToUpdate}
                        setErrors={setErrors}
                        errors={errors}
                    />
                }
                {isToUpdate &&
                <div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div></div>
                    <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={()=>setIsToUpdate(false)} />
                        <RightButton name={'Save'} btnStyle={'text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900'} onClick={handleSetNewPass} />
                    </div>
                </div>
                }
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
                    <NavLink to='/account/billing'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Billing Info")}</p>
                    </NavLink>
                    <p className='transition-all duration-100 ease-in-out text-base mb-2 underline cursor-pointer text-gray-800 dark:text-black dark:font-medium'>{("My profile")}</p>
                    <NavLink to='/account/users'>
                        <p className='my-2 underline cursor-pointer hover:text-gray-800 dark:hover:text-black dark:hover:font-medium'>{("Manage users")}</p>
                    </NavLink>
                </div>
            </div>
        </main>
    )
}

export default Profile