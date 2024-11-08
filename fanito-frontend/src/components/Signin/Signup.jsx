import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios'; // Import axios
import { API_URL } from '../../constant/config';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [isFocused, setIsFocused] = useState({
        companyName: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    });
    const [errors, setErrors] = useState({}); // To hold validation errors

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

    const handleLoginRedirect = () => {
        gsap.to("#signupForm", {
            opacity: 0,
            y: -20,
            duration: 0.5,
            onComplete: () => navigate('/login')
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.companyName) newErrors.companyName = 'O nome da empresa é obrigatório.';
        if (!formData.email) newErrors.email = 'Email é obrigatório.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'O endereço de e-mail é inválido.';
        if (!formData.phone) newErrors.phone = 'Telefone é obrigatório.';
        if (!formData.password) newErrors.password = 'Password é obrigatório.';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Palavras passe não coincidem.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await axios.post(`${API_URL}/company/setcompany`, formData); // Replace with your API endpoint
            console.log(response.data)
            if(response.data.error === 'Email already in use'){
                setErrors({
                    email: 'E-mail já existe'
                })
                return;
            }
            console.log('Signup successful:', response.data);
            handleLoginRedirect();
        } catch (error) {
            console.error('Signup error:', error);
            // Handle error (e.g., display error message)
        }
    };

    useEffect(() => {
        gsap.fromTo("#signupForm", {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
        });
    }, []);

    const styleinput = `w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-gray-200`;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div id="signupForm" className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>

                <form onSubmit={handleSubmit}>
                    {/* Company Name Input */}
                    <div className='relative mb-4'>
                        <label
                            onClick={() => handleFocus('companyName')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.companyName || formData.companyName ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Company Name:
                        </label>
                        <input
                            type="text"
                            className={styleinput}
                            onFocus={() => handleFocus('companyName')}
                            onBlur={() => handleBlur('companyName')}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            value={formData.companyName}
                        />
                        {errors.companyName && <p className="text-red-500 text-xs ml-1 mt-1">{errors.companyName}</p>}
                    </div>

                    {/* Email Input */}
                    <div className='relative mb-4'>
                        <label
                            onClick={() => handleFocus('email')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.email || formData.email ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            E-mail:
                        </label>
                        <input
                            type="text"
                            className={styleinput}
                            onFocus={() => handleFocus('email')}
                            onBlur={() => handleBlur('email')}
                            onChange={(e) => handleChange('email', e.target.value)}
                            value={formData.email}
                        />
                        {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone Input */}
                    <div className='relative mb-4'>
                        <label
                            onClick={() => handleFocus('phone')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.phone || formData.phone ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Telephone: Zimbabwe (+263)
                        </label>
                        <input
                            type="text"
                            className={styleinput}
                            onFocus={() => handleFocus('phone')}
                            onBlur={() => handleBlur('phone')}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            value={formData.phone}
                        />
                        {errors.phone && <p className="text-red-500 text-xs ml-1 mt-1">{errors.phone}</p>}
                    </div>

                    {/* Password Input */}
                    <div className='relative mb-4'>
                        <label
                            onClick={() => handleFocus('password')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.password || formData.password ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Password:
                        </label>
                        <input
                            type="password"
                            className={styleinput}
                            onFocus={() => handleFocus('password')}
                            onBlur={() => handleBlur('password')}
                            onChange={(e) => handleChange('password', e.target.value)}
                            value={formData.password}
                        />
                        {errors.password && <p className="text-red-500 text-xs ml-1 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password Input */}
                    <div className='relative mb-4'>
                        <label
                            onClick={() => handleFocus('confirmPassword')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.confirmPassword || formData.confirmPassword ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Confirm:
                        </label>
                        <input
                            type="password"
                            className={styleinput}
                            onFocus={() => handleFocus('confirmPassword')}
                            onBlur={() => handleBlur('confirmPassword')}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            value={formData.confirmPassword}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs ml-1 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg mb-4">
                        Create
                    </button>
                </form>

                <p className="text-center text-gray-600 dark:text-gray-400">
                    Already have an account? <span className="text-blue-500 cursor-pointer" onClick={handleLoginRedirect}>Login</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;