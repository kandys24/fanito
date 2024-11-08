import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useState, useEffect, useRef } from 'react';

const CustomLogo = ({ logoUrl, updateFormData, isToUpdate, setIsToUpdate }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(logoUrl || null);  // Initialize with existing logo URL if available
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (logoUrl) {
            setPreviewUrl(logoUrl);  // Set preview URL to the existing logo URL on component mount
        }
    }, [logoUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        updateFormData({ logo: file });
        setPreviewUrl(URL.createObjectURL(file));  // Generate a preview URL for the uploaded logo
        setIsToUpdate(true);
    };

    const handleDeleteLogo = () => {
        setSelectedFile(null);
        setPreviewUrl(null);  // Clear the preview
        if (fileInputRef.current) {
            fileInputRef.current.value = '';  // Clear the file input value
        }
        updateFormData({ logo: null });
        setIsToUpdate(true);
    };

    const styleinput = `w-full py-5 px-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    useEffect(() =>{
        if(!isToUpdate){
            if (logoUrl) {
                setPreviewUrl(logoUrl);  // Set preview URL to the existing logo URL on component mount
            }
        }

    }, [isToUpdate])

    useGSAP(() => {
        gsap.fromTo('#myCustomLogo_main', {
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
        <div id='myCustomLogo_main' className="mt-5 bg-white py-5 px-5 dark:bg-[#0E0E0E] rounded-xl shadow">
            <h1 className="text-lg mb-4">Your logo</h1>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Add your logo and get fully personalized documents. Images in format (. jpg, . jpeg, . png) with a size of up to 300 KB and height/width of up to 420px/550px are accepted.
            </p>

            <div className="flex items-center gap-4 mb-4">
                <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300">
                    Logo:<h1 className="text-xs font-bold text-red-500">{("*")}</h1>
                </label>
                <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    onChange={handleFileChange} 
                    ref={fileInputRef} 
                    className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
            </div>

            {previewUrl && (
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={handleDeleteLogo} 
                        className="text-sm text-red-500 hover:underline"
                    >
                        Delete Logo
                    </button>
                </div>
            )}

            <div className={styleinput}>
                <div className='w-full bg-white py-6 px-8'>
                    {previewUrl && (
                        <div>
                            <img 
                                src={previewUrl} 
                                alt="logo" 
                                className='w-[85px] object-contain' 
                            />
                        </div>
                    )}
                    <div className='flex justify-between mt-2'>
                        <div>
                            <h1 className='text-black dark:text-black text-xs'>Company Example</h1>
                            <h1 className='text-gray-600 dark:text-gray-600 text-xs'>Example street address, neighborhood b13</h1>
                        </div>
                        <div>
                            <h1 className='text-gray-600 dark:text-gray-600 text-xs'>Honorable Mr.(s)</h1>
                            <h1 className='text-black dark:text-black text-xs '>Client Example</h1>
                            <h1 className='text-gray-600 dark:text-gray-600 text-xs'>Example street address, neighborhood b14</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomLogo;
