import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import getTokenConfig from '../../../axiosconfig/config';
import { API_URL } from '../../../constant/config';
import axios from 'axios';
import RightButton from '../../Buttons/RightButton';

const CancellationModal = ({ doc_id, doc_type, doc_code, closeCancellationModal }) => {
    const [formData, setFormData] = useState({
        observacoes: '',
        doc_code: doc_code,
        document_type: doc_type,
    });
    const [isFocused, setIsFocused] = useState({
        observacoes: false,
    });
    
    const handleFocus = (field) => {
        setIsFocused(prevState => ({ ...prevState, [field]: true }));
    };

    const handleBlur = (field) => {
        if (!formData[field] && field !== 'vencimento' && field !== 'data') {
            setIsFocused(prevState => ({ ...prevState, [field]: false }));
        }
    };

    const handleChange = (field, value) => {
        setFormData(prevState => ({ ...prevState, [field]: value }));
    };

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    const handleSaveCancellation = async () =>{

        if(!formData.observacoes){
            console.log(formData.observacoes)
            return;
        }

        
        // alert(formData.data);
        // return

        try {
            const response = await axios.post(`${API_URL}/cncell/add-cancellation`, {
                doc_id: doc_id,
                doc_code: formData.doc_code,
                document_type: formData.document_type,
                cancellation_reason: formData.observacoes,
            }, getTokenConfig());
    
            if (response.status === 201) {
                alert('cancellation added successfully!');
                // Reset form or redirect user to another page
                closeCancellationModal();
            }
        } catch (error) {
            console.error('Error adding cancellation:', error);
            alert('Failed to add cancellation. Please try again.');
        }

    }

    return (
        <div 
            id="modal"
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-15 dark:bg-opacity-50 dark:bg-gray-800"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-15 dark:bg-opacity-50 dark:bg-gray-800 filter blur-xl"></div>
            {/*onClick={closeCancellationModal} onClick={(e) => e.stopPropagation()} */}
            <div  className="relative">
                <div className="relative flex justify-end">
                    <IoClose size={38} 
                        className={`
                            absolute -top-5 -right-5 border
                            rounded-full shadow-sm p-2 transition-transform duration-5 bg-white
                            active:translate-y-1 cursor-pointer border-gray-300 hover:bg-gray-300 text-[#0B335F]
                            dark:bg-dark-background dark:text-dark-text dark:border-gray-600 dark:hover:bg-gray-700
                        `}
                        onClick={closeCancellationModal}
                    />
                </div>
                <div className="bg-white shadow-md border-2 border-gray-400 rounded-lg px-10 py-10 pb-12 dark:bg-dark-background dark:border-gray-600">
                    <h1 className="text-center text-xl font-bold mb-3 text-[#0B335F] dark:text-dark-text">
                        Cancellation
                    </h1>
                    <h1 className="text-center text-xs font-bold mb-5 text-[#0B335F] dark:text-dark-text">
                        Required field
                    </h1>
                    {/* Additional modal content can go here */}
                    <div className='flex flex-1 flex-col gap-4'>
                        <div className='relative'>
                            <label htmlFor='observacoes'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.observacoes || formData.observacoes ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Cancellation reason*:
                            </label>
                            <textarea
                                id='observacoes'
                                className={`${styleinput} max-h-[87px] min-h-[87px]`}
                                onFocus={() => handleFocus('observacoes')}
                                onBlur={() => handleBlur('observacoes')}
                                onChange={(e) => handleChange('observacoes', e.target.value)}
                                value={formData.observacoes}
                            />
                        </div>
                    </div>
                    <div className='flex justify-end mt-8 gap-4'>
                        <RightButton name={'Cancel document'} onClick={handleSaveCancellation} />
                        <RightButton name={'Not now'} onClick={closeCancellationModal}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CancellationModal;