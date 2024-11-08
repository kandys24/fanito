import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import getTokenConfig from '../../../axiosconfig/config';
import { API_URL } from '../../../constant/config';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { MdOutlineDateRange } from 'react-icons/md';
import RightButton from '../../Buttons/RightButton';

const NewExpenseModal = ({ invoice, closeNewExpenseModal }) => {
    const [formData, setFormData] = useState({
        data: new Date().toString(),
        observacoes: '',
        description: '',
        meioPagamento: 'Numerário',
        document_style: 'A4',
        valor: '',
    });
    const [isFocused, setIsFocused] = useState({
        data: false,
        observacoes: false,
        description: false,
        meioPagamento: false,
        document_style: false,
        valor: false,
    });
    const [series, setSeries] = useState(null);
    
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

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/series/get-series`, config);
                setSeries(response.data.series);
                // console.log(response.data.series);
            } catch (error) {
                console.error('Error fetching series:', error);
            }
        };
        
        fetchSeries();
    }, []);

    const handleSaveReceipt = async () =>{

        if(!formData.valor || formData?.valor <= 0){
            console.log(formData.valor)
            return;
        }

        
        // alert(formData.data);
        // return

        try {
            const response = await axios.post(`${API_URL}/expenses/add-expense`, {
                document_date: new Date(formData.data),
                payment_method: formData.meioPagamento,
                description: formData.description,
                amount: formData.valor,
                obs: formData.observacoes,
            }, getTokenConfig());
    
            if (response.status === 201) {
                alert('receipt added successfully!');
                // Reset form or redirect user to another page
                closeNewExpenseModal();
            }
        } catch (error) {
            console.error('Error adding invoice and client:', error);
            alert('Failed to add receipt. Please try again.');
        }

    }

    return (
        <div 
            id="modal"
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-15 dark:bg-opacity-50 dark:bg-gray-800"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-15 dark:bg-opacity-50 dark:bg-gray-800 filter blur-xl"></div>
            {/*onClick={closeNewExpenseModal} onClick={(e) => e.stopPropagation()} */}
            <div  className="relative min-w-[350px]">
                <div className="relative flex justify-end">
                    <IoClose size={38} 
                        className={`
                            absolute -top-5 -right-5 border
                            rounded-full shadow-sm p-2 transition-transform duration-5 bg-white
                            active:translate-y-1 cursor-pointer border-gray-300 hover:bg-gray-300 text-[#0B335F]
                            dark:bg-dark-background dark:text-dark-text dark:border-gray-600 dark:hover:bg-gray-700
                        `}
                        onClick={closeNewExpenseModal}
                    />
                </div>
                <div className="bg-white shadow-md border-2 border-gray-400 rounded-lg px-10 py-10 pb-12 dark:bg-dark-background dark:border-gray-600">
                    <h1 className="text-xl text-center font-bold mb-8 text-[#0B335F] dark:text-dark-text">
                        New Expense
                    </h1>
                    {/* Additional modal content can go here */}
                    <div className='flex flex-1 flex-col gap-4'>
                        <div className='relative'>
                            <label htmlFor='description'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.description || formData.description ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Description:
                            </label>
                            <div className='flex gap-4 items-center'>
                                <input
                                    id='description'
                                    type="text"
                                    className={styleinput}
                                    onFocus={() => handleFocus('description')}
                                    onBlur={() => handleBlur('description')}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    value={formData.description}
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div className='relative'>
                            <label htmlFor='valor'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.valor || formData.valor ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Amount:
                            </label>
                            <div className='flex gap-4 items-center'>
                                <input
                                    id='valor'
                                    type="text"
                                    className={styleinput}
                                    onFocus={() => handleFocus('valor')}
                                    onBlur={() => handleBlur('valor')}
                                    onChange={(e) => handleChange('valor', e.target.value)}
                                    value={formData.valor}
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div className='relative flex gap-5 itms-center justify-between'>
                            <DatePicker
                                selected={formData.data}
                                onFocus={() => handleFocus('data')}
                                onBlur={() => handleBlur('data')}
                                onChange={(date) => handleChange('data', date)}
                                className={styleinput}
                                placeholderText="Data"
                                dateFormat="dd/MM/yyyy"
                            />
                            <MdOutlineDateRange className='text-3xl text-gray-500 dark:text-gray-600' />
                        </div>
                        <div className='relative'>
                            <label htmlFor='meioPagamento'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.meioPagamento || formData.meioPagamento ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Payment method:
                            </label>
                            <select
                                id='meioPagamento'
                                className={`${styleinput}`}
                                onFocus={() => handleFocus('meioPagamento')}
                                onBlur={() => handleBlur('meioPagamento')}
                                onChange={(e) => handleChange('meioPagamento', e.target.value)}
                                value={formData.meioPagamento}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Ecocash">Ecocash</option>
                                <option value="InnBucks">InnBucks</option>
                                {/* Add more options as needed */}
                            </select>
                        </div>
                        <div className='relative'>
                            <label htmlFor='observacoes'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.observacoes || formData.observacoes ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Observations:
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
                        <RightButton name={'Record Expense'} onClick={handleSaveReceipt} />
                        <RightButton name={'Cancel'} onClick={closeNewExpenseModal}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewExpenseModal;