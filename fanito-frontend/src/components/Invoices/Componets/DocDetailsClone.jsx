import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MdOutlineDateRange } from "react-icons/md";

const DocDetailsClone = ({ typeofinvo, formData, setFormData, client, series }) => {
    const [isFocused, setIsFocused] = useState({
        data: false,
        vencimento: false,
        ref: false,
        observacoes: false,
        serie: false,
        retencao: false,
        meioPagamento: false,
        document_style: false,
    });

    useEffect(()=>{
        const serie = series?.find(item => item?.defaultValue === 1)
        // console.log(series?.find(item => item?.defaultValue === 1))
        setFormData({
            data: new Date().toString(),
            vencimento: client?.payment_due || 'Pronto Pagamento',
            ref: '',
            observacoes: client?.observations || '',
            serie: serie?.serieName || '2024',
            retencao: '',
            meioPagamento: client?.payment_method || 'Cash',
            document_type: typeofinvo,
            document_style: 'A4',
        });
    },[client, series])
    
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

    const handleDateChange = (date) => {
        setFormData(prevState => ({ ...prevState, vencimento: date }));
        // console.log(date);
    };

    const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-sm
    `;

    return (
        <div className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Document details</h1>
            </div>
            <div className='flex flex-1 justify-between gap-12 mt-5'>
                <div className='w-1/2 flex flex-col gap-4'>
                    <div className='flex flex-1 flex-col gap-4'>
                        <div className='relative flex gap-5 itms-center justify-between'>
                            <DatePicker
                                selected={formData.data}
                                onFocus={() => handleFocus('data')}
                                onBlur={() => handleBlur('data')}
                                className={styleinput}
                                placeholderText="Data"
                                dateFormat="dd/MM/yyyy"
                            />
                            <MdOutlineDateRange className='text-3xl text-gray-500 dark:text-gray-600' />
                        </div>
                        <div className='relative flex gap-5 itms-center justify-between'>
                            <label className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.vencimento || formData.vencimento ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Due Date:
                            </label>
                            <select
                                id='vencimento'
                                className={`${styleinput}`}
                                onFocus={() => handleFocus('vencimento')}
                                onBlur={() => handleBlur('vencimento')}
                                onChange={(e) => handleChange('vencimento', e.target.value)}
                                value={formData.vencimento}
                            >
                                <option value="Pronto Pagamento">Ready to Pay</option>
                                <option value="15 Dias">15 Days</option>
                                <option value="30 Dias">30 Days</option>
                                <option value="45 Dias">45 Days</option>
                                <option value="60 Dias">60 Days</option>
                                <option value="90 Dias">90 Days</option>
                            </select>
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
                            <label htmlFor='serie'
                                className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                                ${isFocused.serie || formData.serie ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                                Serie:
                            </label>
                            <select
                                id='serie'
                                className={`${styleinput}`}
                                onFocus={() => handleFocus('serie')}
                                onBlur={() => handleBlur('serie')}
                                onChange={(e) => handleChange('serie', e.target.value)}
                                value={formData.serie}
                            >
                                {series && series?.map((item, i)=><option key={i} value={item?.serieName}>{item?.serieName}</option>)}
                                {!series && <option value="2024">2024</option>}
                            </select>
                        </div>
                    </div>
                </div>
                <div className='w-1/2 flex flex-col gap-4'>
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
                    <div className='relative'>
                        <label htmlFor='retencao'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.retencao || formData.retencao ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Retention: (%)
                        </label>
                        <input id='retencao'
                            type="text"
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('retencao')}
                            onBlur={() => handleBlur('retencao')}
                            onChange={(e) => handleChange('retencao', e.target.value)}
                            value={formData.retencao}
                        />
                    </div>
                    <div className='relative'>
                        <label htmlFor='document_style'
                            className={`absolute left-3 transition-all duration-300 text-gray-700 dark:text-gray-300 text-opacity-70 dark:text-opacity-50
                            ${isFocused.document_style || formData.document_style ? 'top-[-10px] text-xs bg-white dark:bg-[#0e0e0e] px-1 rounded -ml-1' : 'top-[8.5px] text-sm'}`}>
                            Doc.Style:
                        </label>
                        <select
                            id='document_style'
                            className={`${styleinput}`}
                            onFocus={() => handleFocus('document_style')}
                            onBlur={() => handleBlur('document_style')}
                            onChange={(e) => handleChange('document_style', e.target.value)}
                            value={formData.document_style}
                        >
                            <option value="A4">A4</option>
                            <option value="Thermal">Thermal</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocDetailsClone;