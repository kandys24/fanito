import React, { useEffect, useState } from 'react';
import { BsPatchQuestionFill } from "react-icons/bs";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ClientDetails from './Components/ClientDetails';
import BillingPreferences from './Components/BillingPreferences';
import RightButton from '../Buttons/RightButton';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';

const NewClient = () => {
    const [formData, setFormData] = useState({
        tipo: 'Normal',
        name: '',
        tipoDoc: 'Contribuinte',
        numeroDoc: '',
        endereco: '',
        caixaPostal: '',
        website: '',
        pais: 'Zimbabwe',
        cidade: 'Harare',
        email: '',
        telefone: '',
        telemovel: '',
        fax: '',
        numCopias: 'Original',
        vencimento: 'Pronto Pagamento',
        idioma: 'English',
        meioPagamento: 'Cash',
        observacoes: '',
        moeda: 'United States dollar (USD)'
    });
    const [errors, setErrors] = useState({});
    const [isToUpdate, setIsToUpdate] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Nome é obrigatório';
        if (!formData.email) newErrors.email = 'Email é obrigatório';
        if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const config = getTokenConfig();
            const response = await axios.post(`${API_URL}/comclient/create-client`, formData, config);
            alert('Client created successfully!');
            setFormData({
                tipo: 'Normal',
                name: '',
                tipoDoc: 'Contribuinte',
                numeroDoc: '',
                endereco: '',
                caixaPostal: '',
                website: '',
                pais: 'Zimbabwe',
                cidade: 'Harare',
                email: '',
                telefone: '',
                telemovel: '',
                fax: '',
                numCopias: 'Original',
                vencimento: 'Pronto Pagamento',
                idioma: 'English',
                meioPagamento: 'Cash',
                observacoes: '',
                moeda: 'United States dollar (USD)'
            });
            setIsToUpdate(false);
        } catch (error) {
            console.error('Failed to create client:', error);
            alert('Failed to create client');
        }
    };

    useEffect(() =>{
        if(!isToUpdate){
            setFormData({
                tipo: 'Normal',
                name: '',
                tipoDoc: 'Contribuinte',
                numeroDoc: '',
                endereco: '',
                caixaPostal: '',
                website: '',
                pais: 'Zimbabwe',
                cidade: 'Harare',
                email: '',
                telefone: '',
                telemovel: '',
                fax: '',
                numCopias: 'Original',
                vencimento: 'Pronto Pagamento',
                idioma: 'English',
                meioPagamento: 'Cash',
                observacoes: '',
                moeda: 'United States dollar (USD)'
            });
        }
    }, [isToUpdate])

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
                    <h1 className="text-3xl">{splitText("New Client")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                <ClientDetails formData={formData} setFormData={setFormData} errors={errors} setIsToUpdate={setIsToUpdate} />
                <BillingPreferences formData={formData} setFormData={setFormData} setIsToUpdate={setIsToUpdate} />
                {isToUpdate && 
                <div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div></div>
                    <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={() => setIsToUpdate(false)} />
                        <RightButton name={'Save'} btnStyle={'text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900'} onClick={handleSubmit} />
                    </div>
                </div>}
            </div>
            <div className='w-[255px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Help")}</h1>
                </label>
                <div>
                    <strong>{splitText("New Client registration\n")}</strong>
                </div>
            </div>
        </main>
    )
}

export default NewClient;