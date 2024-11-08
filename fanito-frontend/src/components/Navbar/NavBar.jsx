import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logoWhite from '../../assets/imgs/logos/anita-logo-white.png';
import { MdOutlineNightlightRound, MdLightMode } from "react-icons/md";
import { LuSettings2 } from "react-icons/lu";
import { FaUserAlt } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';

const NavBar = ({ toggleDarkMode, darkMode }) => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('Dashboard');
    const [showSettings, setShowSettings] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation(); // Get the current location

    const settingsRef = useRef(null);
    const buttonRef = useRef(null);

    const handleClickOutside = (event) => {
        if (
            settingsRef.current && 
            !settingsRef.current.contains(event.target) &&
            !buttonRef.current.contains(event.target)
        ) {
            setShowSettings(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Update the selected option based on the current path
        const path = location.pathname;
        if (path === '/') {
            setSelectedOption('Dashboard');
        } else if (path.includes('/invoices')) {
            setSelectedOption('Invoices');
        } else if (path.includes('/proformas')) {
            setSelectedOption('Proformas');
        } else if (path.includes('/clients')) {
            setSelectedOption('Clients');
        } else if (path.includes('/items')) {
            setSelectedOption('Items');
        } else if (path.includes('/expenses')) {
            setSelectedOption('Expenses');
        } else if (path.includes('/reports')) {
            setSelectedOption('Reports');
        }else{
            setSelectedOption('');
        }
    }, [location.pathname]);

    useEffect(() => {
        // Add axios interceptor to handle 401 errors
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token'); // Clear expired token
                    navigate('/login'); // Redirect to login
                }
                return Promise.reject(error);
            }
        );
        
        // Fetch account details from backend
        const fetchAccountInfo = async () => {
            try {
                const config = getTokenConfig();
            
                const response = await axios.get(`${API_URL}/users/ge-tuserole`, config);
                // console.log(response.data.user[0].email)
                setUser(response.data.user[0] || null)
            } catch (error) {
                console.error('Failed to fetch account info:', error);
            }
        };

        fetchAccountInfo();
    }, []);

    const handleLogOut = () =>{
        localStorage.removeItem('token');
        navigate('/login');
    }

    const token = localStorage.getItem('token');

    if (!token) {
        return (navigate('/login'));
    }

    return (
        <header 
            className="flex justify-between py-3 px-6 bg-black dark:bg-gray-600 text-light-text dark:text-dark-text rounded-2xl"
            style={{ marginBottom: '15px', }}
        >
            <img className='w-20 object-contain' src={logoWhite} alt="logo" />
            <div className='flex p-[2px] rounded-xl bg-[#1e1e1e] dark:bg-black'>
                <NavLink 
                    className={`py-3 px-5 text-white text-sm ${selectedOption === 'Dashboard' && 'bg-black dark:bg-[#1e1e1e] rounded-xl shadow-lg'}`}
                    onClick={()=>setSelectedOption('Dashboard')} to="/"
                >
                    Dashboard
                </NavLink>
                <NavLink 
                    className={`py-3 px-5 text-white text-sm ${selectedOption === 'Invoices' && 'bg-black dark:bg-[#1e1e1e] rounded-xl shadow-lg'}`}
                    onClick={()=>setSelectedOption('Invoices')} to="/invoices"
                >
                    Invoices
                </NavLink>
                <NavLink 
                    className={`py-3 px-5 text-white text-sm ${selectedOption === 'Proformas' && 'bg-black dark:bg-[#1e1e1e] rounded-xl shadow-lg'}`}
                    onClick={()=>setSelectedOption('Proformas')} to="/proformas"
                >
                    Proformas
                </NavLink>
                <NavLink 
                    className={`py-3 px-5 text-white text-sm ${selectedOption === 'Clients' && 'bg-black dark:bg-[#1e1e1e] rounded-xl shadow-lg'}`}
                    onClick={()=>setSelectedOption('Clients')} to="/clients"
                >
                    Clients
                </NavLink>
                <NavLink 
                    className={`py-3 px-5 text-white text-sm ${selectedOption === 'Items' && 'bg-black dark:bg-[#1e1e1e] rounded-xl shadow-lg'}`}
                    onClick={()=>setSelectedOption('Items')} to="/items"
                >
                    Items
                </NavLink>
                <NavLink 
                    className={`py-3 px-5 text-white text-sm ${selectedOption === 'Expenses' && 'bg-black dark:bg-[#1e1e1e] rounded-xl shadow-lg'}`}
                    onClick={()=>setSelectedOption('Expenses')} to="/expenses"
                >
                    Expenses
                </NavLink>
                <NavLink 
                    className={`py-3 px-5 text-white text-sm ${selectedOption === 'Reports' && 'bg-black dark:bg-[#1e1e1e] rounded-xl shadow-lg'}`}
                    onClick={()=>setSelectedOption('Reports')} to="/reports"
                >
                    Reports
                </NavLink>
            </div>
            <div className='flex gap-2 relative'>
                {/* <button
                    onClick={toggleDarkMode}
                    className="flex px-2 py-1 items-center bg-gray-600 dark:bg-dark-accent rounded-xl"
                >
                    <div className='py-2 px-2 rounded-xl dark:bg-gray-600'><MdOutlineNightlightRound /></div>
                    <div className='py-2 px-2 rounded-xl bg-dark-accent dark:bg-dark-accent text-white dark:text-black'><MdLightMode /></div>
                </button> */}
                <button
                    ref={buttonRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                    }}
                    className="flex px-3 py-1 items-center bg-gray-600 dark:bg-black rounded-xl 
                        shadow transition-all duration-100 ease-in-out
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:opacity-90 active:rotate-12
                        active:scale-95 active:shadow-inner
                    "
                >
                    <LuSettings2 className='text-2xl text-white transition-all duration-100 ease-in-out ' />
                </button>
                {showSettings &&
                <div
                    ref={settingsRef} 
                    className='absolute top-14 p-5 -right-6 rounded-xl bg-gray-600 dark:bg-[#1e1e1e] w-[255px] z-999999999 shadow'
                >
                    <div className='flex gap-2 items-center'>
                        <div className='bg-white rounded-full p-3'>
                            <FaUserAlt className='text-2xl text-gray-600 dark:text-[#1e1e1e]' />
                        </div>
                        <div>
                            <h1 className='text-white text-xs'>{user.email && user.email}</h1>
                            <h1 className='text-white text-sm font-semibold mt-[1px]'>{user.role === 'admin' ? 'Administrator' : user.role === 'collab' ? 'Collaborator' : 'Seller'}</h1>
                        </div>
                    </div>
                    <NavLink to='/account'>
                        <div className='flex gap-2 items-center text-white cursor-pointer' onClick={()=>setShowSettings(!showSettings)}>
                            <h1 className='ml-[56px] underline text-sm'>View account</h1>
                        </div>
                    </NavLink>
                    <div className='flex gap-2 items-center mt-4 text-white cursor-pointer' onClick={()=>{
                        toggleDarkMode(); 
                        // setShowSettings(!showSettings)
                    }}>
                    {darkMode ? <MdOutlineNightlightRound className='text-xl text-gray-600' /> : <MdLightMode className='text-xl text-dark-accent' />}
                        <h1>Mode: {darkMode ? 'dark' : 'light'}</h1>
                    </div>
                    <NavLink to='/settings'>
                        <div className='flex gap-2 items-center mt-4 text-white cursor-pointer' onClick={()=>setShowSettings(!showSettings)}>
                            <IoMdSettings className='text-xl' />
                            <h1>Settings</h1>
                        </div>
                    </NavLink>
                    <div className='flex gap-2 items-center mt-4 text-white cursor-pointer'>
                        <IoLogOut onClick={handleLogOut} className='text-xl' />
                        <h1 onClick={handleLogOut}>Logout</h1>
                    </div>
                </div>}
            </div>
        </header>
    )
}

export default NavBar;