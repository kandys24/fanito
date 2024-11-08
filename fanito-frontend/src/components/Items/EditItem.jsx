import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant/config';
import getTokenConfig from '../../axiosconfig/config';
import ItemDetails from './Components/ItemDetails';
import RightButton from '../Buttons/RightButton';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { BsPatchQuestionFill } from 'react-icons/bs';

const EditItem = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        codigo: '',
        descricao: '',
        unidade: 'Unidade',
        retencao: 'Aplicar',
        precoUnitario: '',
        taxaIva: '0.00',
        motivoIsenção: '0',
        pvp: '',
        quantity: '0',
    });
    const [taxes, setTaxes] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Fetch item details for editing
        const fetchItemDetails = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/comitems/items/${itemId}`, config);
                if(response.data){
                    setFormData({
                        codigo: response.data.code,
                        descricao: response.data.description,
                        unidade: response.data.unit,
                        retencao: response.data.retention,
                        precoUnitario: response.data.unit_price,
                        taxaIva: response.data.tax_rate.toFixed(2),
                        motivoIsenção: response.data.exemption_reason,
                        pvp: true ? '' : `${response.data.unit_price * (Number(response.data.tax_rate) / 100)}`,
                        quantity: response.data.quantity
                    });
                    // console.log(response.data.unit_price * (Number(response.data.tax_rate) / 100))
                }
            } catch (error) {
                console.error('Failed to fetch item details:', error);
            }
        };

        fetchItemDetails();
    }, [itemId]);

    useEffect(() => {
        // Fetch taxes for the form
        const fetchTax = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/pordefinir/ge-ttax`, config);
                setTaxes(response.data.mytax);
            } catch (error) {
                console.error('Failed to fetch taxes:', error);
            }
        };

        fetchTax();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.descricao) newErrors.descricao = 'Descrição é obrigatória';
        // Preço Unitário validation
        if (!formData.precoUnitario) {
            newErrors.precoUnitario = 'Preço Unitário é obrigatório';
        } else {

            // Regular expression to check for valid decimal format
            const decimalRegex = /^\d+(\.\d{1,2})?$/;
            if (!decimalRegex.test(formData.precoUnitario)) {
                newErrors.precoUnitario = 'Preço Unitário deve ser um número válido com até duas casas decimais';
            }

            // Check if the value contains a comma instead of a point
            if (String(formData.precoUnitario).includes(',')) {
                newErrors.precoUnitario = 'Preço Unitário deve usar ponto (.) como separador decimal';
            }
        }
        if (!formData.taxaIva) newErrors.taxaIva = 'Taxa/IVA é obrigatória';

        const quantityRegex = /^\d+$/;
        if (!quantityRegex.test(formData.quantity)) {
            newErrors.quantity = 'A quantidade é um número inteiro';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const config = getTokenConfig();
            await axios.put(`${API_URL}/comitems/update-item/${itemId}`, formData, config);
            navigate(-1);
            alert('Item updated successfully!');
        } catch (error) {
            console.error('Failed to update item:', error);
            alert('Failed to update item');
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

    return (
        <main className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl">
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText("Edit Item")}</h1>
                    <label className='flex items-center'>
                        <h1 className="text-sm">{splitText("Required fields")}</h1>
                        <h1 className="text-lg font-bold text-red-500">{splitText("*")}</h1>
                    </label>
                </div>
                {formData && <ItemDetails taxes={taxes} formData={formData} setFormData={setFormData} errors={errors} setIsToUpdate={() => {}} />}
                <div className='flex justify-between items-center mt-5 bg-white py-5 px-5 mb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div></div>
                    <div className='flex gap-5'>
                        <RightButton name={'Cancel'} onClick={() => navigate(-1)} />
                        <RightButton name={'Save'} btnStyle={'text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900'} onClick={handleSubmit} />
                    </div>
                </div>
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <label className='flex items-center gap-1 border-b border-black pb-1'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Item Reports")}</h1>
                </label>
                <div>
                    {/* <strong>{splitText("Registo de novo cliente\n")}</strong> */}
                    <p className='mb-3'>{splitText("\nFind out how much you earned in a given period of time. Values ​​with and without Fees.")}</p>
                    <strong>{splitText("Billing by Item\n")}</strong>
                </div>
            </div>
        </main>
    );
};

export default EditItem;
