import React, { useEffect, useState } from 'react';
import { BsPatchQuestionFill } from "react-icons/bs";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ItemDetails from './Components/ItemDetails';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';
import RightButton from '../Buttons/RightButton';

const NewItem = () => {
    const [formData, setFormData] = useState({
        codigo: '',
        descricao: '',
        unidade: 'Unidade',
        retencao: 'Não Aplicar',
        precoUnitario: '',
        taxaIva: '0.00',
        motivoIsenção: '0',
        pvp: '',
        quantity: '0',
    });
    const [isToUpdate, setIsToUpdate] = useState(false);
    const [taxes, setTaxes] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Fetch account details from backend
        const fetchTax = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/pordefinir/ge-ttax`, config);
                // console.log(response.data.mytax)
                setTaxes(response.data.mytax);
            } catch (error) {
                console.error('Failed to fetch account info:', error);
            }
        };

        fetchTax();
    }, []);

    useEffect(() => {
        // Fetch code details from backend
        const unit = formData.unidade;

        const fetchCode = async () => {
            try {
                const config = {
                    ...getTokenConfig(),
                    params: { unit },
                };
                const response = await axios.get(`${API_URL}/comitems/ge-tcode`, config);
                // console.log(response.data.code)
                if(response.data.code)
                    setFormData({ ...formData, codigo: response.data.code });
            } catch (error) {
                console.error('Failed to fetch code info:', error);
            }
        };
        if(!isToUpdate){
            fetchCode();
        }
    }, [formData.unidade, isToUpdate]);

    useEffect(() => {
        const unit = formData.unidade;

        const fetchCode = async () => {
            try {
                const config = {
                    ...getTokenConfig(),
                    params: { unit },
                };
                const response = await axios.get(`${API_URL}/comitems/ge-tcode`, config);
                // console.log(response.data.code)
                if(response.data.code)
                    setFormData({ ...formData, codigo: response.data.code });
                    // setFormData({ ...formData, codigo: response.data.code });

            } catch (error) {
                console.error('Failed to fetch code info:', error);
            }
        };

        fetchCode()
        // if(Number(formData.taxaIva) === 0)
        //     setFormData({ ...formData, motivoIsenção: '0' });
    }, [formData.unidade]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.descricao) newErrors.descricao = 'Description is mandatory';
        // Preço Unitário validation
        if (!formData.precoUnitario) {
            newErrors.precoUnitario = 'Unit Price is mandatory';
        } else {
            // Regular expression to check for valid decimal format
            const decimalRegex = /^\d+(\.\d{1,2})?$/;
            if (!decimalRegex.test(formData.precoUnitario)) {
                newErrors.precoUnitario = 'Unit Price must be a valid number with up to two decimal places';
            }

            // Check if the value contains a comma instead of a point
            if (formData.precoUnitario.includes(',')) {
                newErrors.precoUnitario = 'Unit price must use period (.) as decimal separator';
            }
        }
        if (!formData.taxaIva) newErrors.taxaIva = 'Tax/VAT is mandatory';

        if (formData.taxaIva === '0.00' && formData.motivoIsenção === '0' ) newErrors.motivoIsenção = 'Exemption reason is mandatory';

        const quantityRegex = /^\d+$/;
        if (!quantityRegex.test(formData.quantity)) {
            newErrors.quantity = 'Quantity is a whole number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const config = getTokenConfig();
            const response = await axios.post(`${API_URL}/comitems/create-item`, formData, config);
            // alert('Item created successfully!');
            // Optionally, reset the form here
            setFormData({
                codigo: '',
                descricao: '',
                unidade: 'Unidade',
                retencao: 'Não Aplicar',
                precoUnitario: '',
                taxaIva: '0.00',
                motivoIsenção: '0',
                pvp: '',
                quantity: '0'
            });
            setIsToUpdate(false)
        } catch (error) {
            console.error('Failed to create item:', error);
            alert('Failed to create item');
        }
    };

    useEffect(() =>{
        if(!isToUpdate){
            setFormData({
                codigo: '',
                descricao: '',
                unidade: 'Unidade',
                retencao: 'Não Aplicar',
                precoUnitario: '',
                taxaIva: '0.00',
                motivoIsenção: '0',
                pvp: '',
                quantity: '0'
            });
            setErrors({});
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
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("New Item")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                <ItemDetails op={'Add New Item'} taxes={taxes} formData={formData} setFormData={setFormData} errors={errors} setIsToUpdate={setIsToUpdate} />
                {isToUpdate &&<div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div></div>
                    <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={()=>setIsToUpdate(false)} />
                        <RightButton name={'Save'} btnStyle={'text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900'} onClick={handleSubmit} />
                    </div>
                </div>}
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Item Reports")}</h1>
                </label>
                <div>
                    {/* <strong>{splitText("Registo de novo cliente\n")}</strong> */}
                    <p className='mb-3'>{splitText("\nFind out how much you earned in a given period of time. Values with and without Fees.")}</p>
                    <strong>{splitText("Billing by Item\n")}</strong>
                </div>
            </div>
        </main>
    )
}

export default NewItem;