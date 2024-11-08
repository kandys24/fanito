import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios'; // Import axios
import { API_URL } from '../../constant/config'; // Adjust path to your API_URL

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isFocused, setIsFocused] = useState({
        email: true,
        password: true
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
        setErrors(prevState => ({ ...prevState, [field]: '', ['form']: '' }));
    };

    const handleSignupRedirect = () => {
        gsap.to("#loginForm", {
            opacity: 0,
            y: -20,
            duration: 0.5,
            onComplete: () => navigate('/signup')
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email é obrigatório.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'O endereço de e-mail é inválido.';
        if (!formData.password) newErrors.password = 'Password é obrigatório.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await axios.post(`${API_URL}/users/login`, formData);
            if(response.data.message === 'company inactive'){
                navigate('/accountnotactive');
                return;
            }
            // console.log('Login successful:', response.data);
            // Store the token (if any) and redirect
            localStorage.setItem('token', response.data.token); // Store token in local storage or use a state management tool
            navigate('/'); 
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ ...errors, form: 'Por favor, verifique as suas credenciais.' });
        }
    };

    useEffect(() => {
        gsap.fromTo("#loginForm", {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
        });

        
    }, []);

    const styleinput = `w-full p-3 border rounded dark:bg-gray-700 dark:text-gray-200`;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div id="loginForm" className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className='relative mb-4'>
                        <label htmlFor='email'
                            onClick={() => handleFocus('email')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.email || formData.email ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            E-mail:
                        </label>
                        <input id='email'
                            type="text"
                            className={`${styleinput} ${errors.email && 'border-red-600'}`}
                            onFocus={() => handleFocus('email')}
                            onBlur={() => handleBlur('email')}
                            onChange={(e) => handleChange('email', e.target.value)}
                            value={formData.email}
                        />
                        {errors.email && <p className="text-red-500 text-xs ml-1 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Input */}
                    <div className='relative mb-4'>
                        <label htmlFor='password'
                            onClick={() => handleFocus('password')}
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.password || formData.password ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Password:
                        </label>
                        <input id='password'
                            type="password"
                            className={`${styleinput} ${errors.password && 'border-red-600'}`}
                            onFocus={() => handleFocus('password')}
                            onBlur={() => handleBlur('password')}
                            onChange={(e) => handleChange('password', e.target.value)}
                            value={formData.password}
                        />
                        {errors.password && <p className="text-red-500 text-xs ml-1 mt-1">{errors.password}</p>}
                        {errors.form && <p className="text-red-500 text-xs ml-1 mt-1">{errors.form}</p>}
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-500 text-white rounded-lg mb-4">
                        Login
                    </button>
                </form>

                <p className="text-center text-gray-600 dark:text-gray-400">
                    Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={handleSignupRedirect}>Create</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
