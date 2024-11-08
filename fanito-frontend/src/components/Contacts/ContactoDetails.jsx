import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LeftButton from '../Buttons/LeftButton';
import MainDetails from './Components/MainDetails';
import MoreDetails from './Components/MoreDetails';
import { API_URL } from '../../constant/config';
import getTokenConfig from '../../axiosconfig/config';

const ContactoDetails = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState(null);
    const [billingPreferences, setBillingPreferences] = useState(null);

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                const config = getTokenConfig();
                const response = await axios.get(`${API_URL}/comclient/clients/${clientId}`, config);
                setClientData(response.data);
                setBillingPreferences(response.data.billingPreferences);
            } catch (error) {
                console.error('Error fetching client details:', error);
                // navigate('/error'); // Navigate to an error page or handle it appropriately
            }
        };

        fetchClientDetails();
    }, [clientId, navigate]);

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

    if (!clientData || !billingPreferences) return <div>Loading...</div>;

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                <h1 className="text-3xl">{splitText(clientData.name)}</h1>
                </div>
                <div id='myBillingPreferences_main' className='flex justify-between mt-5 bg-white py-5 px-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div className='flex flex-col items-center'><h1 className='text-2xl'>0,00 Kz</h1><span className='text-sm'>Balance</span></div>
                    <div className='flex flex-col items-center'><h1 className='text-2xl'>0,00 Kz</h1><span className='text-sm'>Within Deadline</span></div>
                    <div className='flex flex-col items-center'><h1 className='text-2xl'>124.000,00 Kz</h1><span className='text-sm'>Overdue</span></div>
                    <div className='flex flex-col items-center'><h1 className='text-2xl'>0 dias</h1><span className='text-sm'>Average payout</span></div>
                </div>
                <MainDetails contactDetails={clientData} />
                <MoreDetails billingPreferences={billingPreferences} />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <LeftButton name={'Editar Cliente'} to={`/clients/edit/${clientId}`}/>
                {/* <LeftButton name={'Apagar Contacto'} to={'/clients/new'}/> */}
                {/* <LeftButton name={'Enviar Conta Corrente'} to={'/clients/new'}/> */}
                <LeftButton name={'Novo Contacto'} to={'/clients/new'}/>
            </div>
        </main>
    )
}

export default ContactoDetails;