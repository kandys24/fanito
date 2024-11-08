import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { BsPatchQuestionFill } from 'react-icons/bs';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';

const ExportSaft = () => {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [months, setMonths] = useState([]);
    const [years, setYears] = useState([]);
    const [monthError, setMonthError] = useState('');
    const [yearError, setYearError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const monthOptions = [
            { value: 1, label: 'Janeiro' },
            { value: 2, label: 'Fevereiro' },
            { value: 3, label: 'Março' },
            { value: 4, label: 'Abril' },
            { value: 5, label: 'Maio' },
            { value: 6, label: 'Junho' },
            { value: 7, label: 'Julho' },
            { value: 8, label: 'Agosto' },
            { value: 9, label: 'Setembro' },
            { value: 10, label: 'Outubro' },
            { value: 11, label: 'Novembro' },
            { value: 12, label: 'Dezembro' },
        ].filter(month => month.value <= currentMonth);

        const yearOptions = [];
        for (let year = currentYear; year >= currentYear - 0; year--) {
            yearOptions.push({ value: year, label: year.toString() });
        }

        setMonths(monthOptions);
        setYears(yearOptions);
    }, []);

    const handleMonthChange = (selectedOption) => {
        setSelectedMonth(selectedOption);
        setMonthError('');
    };

    const handleYearChange = (selectedOption) => {
        setSelectedYear(selectedOption);
        setYearError('');
    };

    const handleSaft = async () => {
        if (!selectedMonth) {
            setMonthError('Por favor, selecione o mês');
            return;
        }
        if (!selectedYear) {
            setYearError('Por favor, selecione o ano');
            return;
        }

        setLoading(true);

        try {
            const config = {
                ...getTokenConfig(),
                params: {
                    year: selectedYear.value,
                    month: selectedMonth.value
                },
            };
            const response = await axios.get(`${API_URL}/saft/export-saftao-xml`, config);

            setLoading(false);

            if (response.data.error === 'Internal server error') {
                console.log(response.data.err);
            } else {
                const blob = new Blob([response.data], { type: 'application/xml' });

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `saft-ao-${new Date().toISOString().split("T")[0]}.xml`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                console.log('Saft downloaded');
            }
        } catch (error) {
            setError('Error fetching data');
            setLoading(false);
        }
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: '4px',
            borderColor: state.isFocused ? '#35c8c8' : '#ccc',
            boxShadow: state.isFocused ? '0 0 0 1px #35c8c8' : 'none',
            '&:hover': {
                borderColor: '#35c8c8',
            },
            padding: '1px',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#888',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#35c8c8',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '4px',
            zIndex: 9999,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#35c8c8' : state.isFocused ? '#f1f1f1' : '#fff',
            color: state.isSelected ? '#fff' : '#333',
            '&:hover': {
                backgroundColor: '#e2e2e2',
            },
        }),
    };

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">Exportar Saft</h1>
                </div>
                <div className="mt-5">
                    <div className="flex flex-col">
                        {monthError && <span className="text-red-600 mb-2 block">{monthError}</span>}
                        {yearError && <span className="text-red-600 mb-2 block">{yearError}</span>}
                        <div className='flex justify-between items-end gap-3'>
                            <div className='flex items-end gap-3 w-1/2'>
                                <div className='w-full'>
                                    <label className="block text-sm font-medium mb-1">Mês:</label>
                                    <Select
                                        id="month-input"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        options={months}
                                        placeholder="Selecione o mês"
                                        styles={customStyles}
                                    />
                                </div>
                                <div className='w-full'>
                                    <label className="block text-sm font-medium mb-1">Ano:</label>
                                    <Select
                                        id="year-input"
                                        value={selectedYear}
                                        onChange={handleYearChange}
                                        options={years}
                                        placeholder="Selecione o ano"
                                        styles={customStyles}
                                    />
                                </div>
                            </div>
                            <div className='flex items-end gap-3'>
                                <button 
                                    onClick={handleSaft} 
                                    className="w-full text-sm py-5 px-10 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                                        bg-[#f1f1f1] dark:bg-black
                                        text-black dark:text-white 
                                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                                        active:scale-95 active:shadow-inner"
                                >
                                    Exportar SAF-T AO
                                </button>
                            </div>
                        </div>
                        {loading && <p className="text-blue-500 font-semibold">Loading...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        <div className="w-full mt-16">
                            <div className="flex gap-4 items-center">
                                <h1 className="text-5xl">Kz</h1>
                                <div>
                                    <h3 className="text-xl">Exportação SAF-T AO</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Selecione o mês e o ano e clique em "Exportar SAF-T AO"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1 mt-3'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">Ajuda</h1>
                </label>
                <div className='text-sm'>
                    <strong>Para que servem o SAFT AO?</strong>
                    <p className='my-2'>Um relatório serve para consolidar os dados armazenados, criando tabelas que fornecerão informação sobre o volume de facturação.</p>
                </div>
            </div>
        </main>
    );
};

export default ExportSaft;