import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LeftButton from '../Buttons/LeftButton';
import ItemInfo from './Components/ItemInfo';
import { API_URL } from '../../constant/config';
import getTokenConfig from '../../axiosconfig/config';

const ItemDetail = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const config = getTokenConfig()
                const response = await axios.get(`${API_URL}/comitems/items/${itemId}`, config);
                setItem(response.data);
            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        fetchItem();
    }, [itemId]);

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

    const setCurrencyFormat = (amount) => {
        const pamount = amount || 0;
        const numberOfDecimals = 2; 
        const formattedValue = pamount.toLocaleString("pt-ao", {
            style: "currency",
            currency: "AOA",
            minimumFractionDigits: numberOfDecimals,
            maximumFractionDigits: numberOfDecimals,
        });
    
        return formattedValue;
    };

    if (!item) return <div>Loading...</div>;

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText(item.description)}</h1>
                </div>
                <div id='myBillingPreferences_main' className='flex justify-between mt-5 bg-white py-5 px-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
                    <div className='flex flex-col items-center'>
                        <h1 className='text-2xl'>{setCurrencyFormat(item.unit_price)}</h1>
                        <span className='text-sm'>Unit price</span>
                    </div>
                    <div className='flex flex-col items-center'>
                        <h1 className='text-2xl'>{setCurrencyFormat(item.pvp || (item.unit_price * (1 + item.tax_rate / 100)))}</h1>
                        <span className='text-sm'>RRR</span>
                    </div>
                    <div className='flex flex-col items-center'>
                        <h1 className='text-2xl'>{(item.sold_units) || 0}</h1>
                        <span className='text-sm'>Unit(s) Sold</span>
                    </div>
                    <div className='flex flex-col items-center'>
                        <h1 className='text-2xl'>{setCurrencyFormat(item.total_sold)}</h1>
                        <span className='text-sm'>Total Sold</span>
                    </div>
                </div>
                <ItemInfo itemDetails={item} />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <LeftButton name={'Edit Item'} to={`/items/edit/${itemId}`}/>
                <LeftButton name={'Delete Item'} to={`/items/delete/${itemId}`}/>
                <LeftButton name={'New Item'} to={'/items/new'}/>
            </div>
        </main>
    );
}

export default ItemDetail;