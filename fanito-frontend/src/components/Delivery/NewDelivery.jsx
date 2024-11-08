import React, { useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BsPatchQuestionFill } from "react-icons/bs";
import { FaSearch } from 'react-icons/fa';
import InputClient from '../Invoices/Componets/InputClient';
import DocDetails from '../Invoices/Componets/DocDetails';
import TableProduct from '../Invoices/Componets/TableProduct';
import LeftButton from '../Buttons/LeftButton';

const users = [
    {
        user_id: 1,
        user_name: 'John Doe',
        user_email: 'johndoe@example.com',
        user_contribuinte: '123456789',
        user_endereco: '123 Main St',
        user_caixaPostal: '12345',
        user_cidade: 'Sample City'
    },
    {
        user_id: 2,
        user_name: 'Jane Smith',
        user_email: 'janesmith@example.com',
        user_contribuinte: '987654321',
        user_endereco: '456 Elm St',
        user_caixaPostal: '67890',
        user_cidade: 'Another City'
    },
];

const NewDelivery = () => {
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [user, setUser] = useState(null); // null indicates no user selected

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (value) {
            const filteredSuggestions = users.filter(user =>
                user.user_name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (user) => {
        setUser(user); // Show the selected user's details
        setSearchValue(''); // Clear search input
        setSuggestions([]); // Hide suggestions
    };

    const handEmptyUser = () => {
        setUser(null); // Show the selected user's details
    };

    const splitText = (text) => {
        return text.split("").map((char, index) => (
            <span key={index} className="letter">
                {char}
            </span>
        ));
    };

    useGSAP(() => {
        gsap.fromTo(
            '.letter', 
            {
                opacity: 0,
                y: 20,
            }, 
            {
                opacity: 1,
                y: 0,
                delay: 0.5,
                stagger: 0.05,
            }
        );
    }, []);

    return (
        <main 
            className="flex gap-20 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Nova guia de transporte")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Campos obrigatórios")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                {!user ?(
                    <div className='relative mt-4 px-5'>
                        <div className='relative'>
                            <input 
                                placeholder='Procure um cliente' 
                                type='text' 
                                className='w-full py-2 px-8 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm
                                    text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400
                                '
                                value={searchValue} 
                                onChange={handleChange} 
                                name='search'
                                autoComplete="off"
                            />
                            <FaSearch className='absolute z-1 top-[13px] ml-3 text-[0.8rem]'/>
                        </div>
                        {/* Suggestions List */}
                        {suggestions.length > 0 && (
                            <ul className="absolute bg-white dark:bg-[#0e0e0e] text-sm shadow-lg rounded-lg w-full max-h-72 overflow-y-auto z-10">
                                <li key={'novo_1'} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <button 
                                        type="button" 
                                        onClick={handleSelect} 
                                        className="block w-full text-left py-2 px-4 font-bold text-blue-600 dark:text-blue-400"
                                    >
                                        + Novo Cliente
                                    </button>
                                </li>
                                {suggestions.map((user, index) => (
                                    <li key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <button 
                                            type="button" 
                                            onClick={() => handleSelect(user)} 
                                            className="block w-full text-left py-2 px-4 text-gray-900 dark:text-gray-100"
                                        >
                                            {user.user_name} ({user.user_email})
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )
                :<InputClient handEmptyUser={handEmptyUser} user={user} />
                }
                <DocDetails />
                <TableProduct />
                <div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div>Pagamento previsto pelo Factplus para 17/08/2024</div>
                    <div className='flex gap-5'>
                        <LeftButton name={'Cancelar'} />
                        <LeftButton name={'Guardar como rascunho'} />
                    </div>
                </div>
            </div>
            <div className='w-[255px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Ajuda")}</h1>
                </label>
                <p>{splitText("Novo Cliente?\n")}
                    {splitText("\nSe este documento é para um novo cliente, basta preencher os campos ‘Dados do Cliente’ e ao criar o documento o novo cliente será também criado.")}
                </p>
            </div>
        </main>
    )
}

export default NewDelivery;