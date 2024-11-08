import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState } from 'react';

const ProfileDetails = ({ formData, setFormData, setIsToUpdate, setErrors, errors }) => {
    const [isFocused, setIsFocused] = useState({
        email: false,
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
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
        setErrors(prevState => ({ ...prevState, [field]: '' }));
        setIsToUpdate(true);
    };

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    useGSAP(() => {
        gsap.fromTo('#myProfile_main', {
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
        <div id='myProfile_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Perfil</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='relative'>
                        <label htmlFor='email'
                            onClick={() => setIsFocused(prevState => ({ ...prevState, ['email']: !isFocused.email }))}
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
                            readOnly
                        />
                        {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email}</p>}
                    </div>
                    <div className='relative'>
                        <label htmlFor='currentPassword'
                            onClick={() => setIsFocused(prevState => ({ ...prevState, ['currentPassword']: !isFocused.currentPassword }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.currentPassword || formData.currentPassword ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Current password:
                        </label>
                        <input
                            id='currentPassword'
                            type="password"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('currentPassword')}
                            onBlur={() => handleBlur('currentPassword')}
                            onChange={(e) => handleChange('currentPassword', e.target.value)}
                            value={formData.currentPassword}
                        />
                        {errors.currentPassword && <p className="text-red-500 text-xs ml-1 mt-1">{errors.currentPassword}</p>}
                    </div>
                    <div className='relative'>
                        <label htmlFor='newPassword'
                            onClick={() => setIsFocused(prevState => ({ ...prevState, ['newPassword']: !isFocused.newPassword }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.newPassword || formData.newPassword ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            New password:
                        </label>
                        <input
                            id='newPassword'
                            type="password"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('newPassword')}
                            onBlur={() => handleBlur('newPassword')}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                            value={formData.newPassword}
                        />
                        {errors.newPassword && <p className="text-red-500 text-xs ml-1 mt-1">{errors.newPassword}</p>}
                    </div>
                    <div className='relative'>
                        <label htmlFor='confirmPassword'
                            onClick={() => setIsFocused(prevState => ({ ...prevState, ['confirmPassword']: !isFocused.confirmPassword }))}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.confirmPassword || formData.confirmPassword ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Confirmation:
                        </label>
                        <input
                            id='confirmPassword'
                            type="password"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('confirmPassword')}
                            onBlur={() => handleBlur('confirmPassword')}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            value={formData.confirmPassword}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs ml-1 mt-1">{errors.confirmPassword}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileDetails;