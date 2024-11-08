import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const NotActive = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isFocused, setIsFocused] = useState({
        email: false,
        password: false
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
    };

    const handleSignupRedirect = () => {
        gsap.to("#notActive", {
            opacity: 0,
            y: -20,
            duration: 0.5,
            onComplete: () => navigate('/login')
        });
    };

    useEffect(() => {
        gsap.fromTo("#notActive", {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
        });
    }, []);

    const styleinput = `w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:text-gray-200`;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div id="notActive" className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">Activate Account</h2>
                <p className="text-center text-black dark:text-white">
                    Check your email to activate your account
                </p>
                <p className="text-center text-gray-600 dark:text-gray-400">
                    <span className="text-blue-500 cursor-pointer" onClick={handleSignupRedirect}>Login</span>
                </p>
            </div>
        </div>
    )
}

export default NotActive;