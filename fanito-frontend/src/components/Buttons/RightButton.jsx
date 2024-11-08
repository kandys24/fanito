import React from 'react';
import { useNavigate } from 'react-router-dom';

const RightButton = ({ btnStyle, name, onClick }) => {
    return (
        <button 
            className={`text-sm py-3 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-95 active:shadow-inner
                        ${btnStyle}`}
            onClick={() =>onClick()}
        >
            {name}
        </button>
    )
}

export default RightButton;