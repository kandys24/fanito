import React from 'react';
import './StartingLoading.css'

const StartingLoading = ({ loading, logo }) => {
    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#43cea2] via-[#185a9d] to-[#43cea2] animate-gradientAnimation relative overflow-hidden">
                <img className="w-[250px] md:w-[500px] animate-logoAnimation" src={logo} alt="Fanito" />
                {/* <p className="text-white mt-[-2rem] animate-textAnimation">By SoftWise</p> */}
            </div>
        );
    }

    return null; // Or return the main content when not loading
};

export default StartingLoading;