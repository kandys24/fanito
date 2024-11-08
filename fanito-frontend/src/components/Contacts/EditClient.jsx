import React, { useEffect, useState } from 'react';
import { BsPatchQuestionFill } from "react-icons/bs";
import { useGSAP } from '@gsap/react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import ClientDetails from './Components/ClientDetails';
import BillingPreferences from './Components/BillingPreferences';
import RightButton from '../Buttons/RightButton';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';

const EditClient = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
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

    useEffect(() => {
        // Fetch item details for editing
        const fetchItemDetails = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/comclient/clients/${clientId}`, config);
                if(response.data){
                    setFormData({
                        tipo: response.data.type || '',
                        name: response.data.name || '',
                        tipoDoc: response.data.document_type || '',
                        numeroDoc: response.data.document_number || '',
                        endereco: response.data.address || '',
                        caixaPostal: response.data.postal_box || '',
                        website: response.data.website || '',
                        pais: response.data.country || '',
                        cidade: response.data.city || '',
                        email: response.data.email || '',
                        telefone: response.data.phone || '',
                        telemovel: response.data.mobile || '',
                        fax: response.data.fax || '',
                        numCopias: response.data.billingPreferences.copies || '',
                        vencimento: response.data.billingPreferences.payment_due || '',
                        idioma: response.data.billingPreferences.language || '',
                        meioPagamento: response.data.billingPreferences.payment_method || '',
                        observacoes: response.data.billingPreferences.observations || '',
                        moeda: response.data.billingPreferences.currency || ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch item details:', error);
            }
        };

        fetchItemDetails();
    }, [clientId]);

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
            const response = await axios.put(`${API_URL}/comclient/update-client/${clientId}`, formData, config);
            navigate(-1);
            alert('Client updated successfully!');
        } catch (error) {
            console.error('Failed to updated client:', error);
            alert('Failed to updated client');
        }
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

    if (!formData.name) return (<div>Loading...</div>);

    return (
        <main 
            className="flex gap-20 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Edit Client")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                {formData &&<ClientDetails formData={formData} setFormData={setFormData} errors={errors} setIsToUpdate={setIsToUpdate} />}
                {formData &&<BillingPreferences formData={formData} setFormData={setFormData} setIsToUpdate={setIsToUpdate} />}
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
                    <strong>{splitText("New client registration\n")}</strong>
                </div>
            </div>
        </main>
    )
}

export default EditClient;