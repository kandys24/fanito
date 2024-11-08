import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { API_URL } from '../../constant/config';
import getTokenConfig from '../../axiosconfig/config';
import ExpenseInfo from './Components/ExpenseInfo';
import RightButton from '../Buttons/RightButton';
import { BsPatchQuestionFill } from 'react-icons/bs';

const ExpenseDetail = () => {
    const { expenseId } = useParams();
    const navigate = useNavigate();
    const [expense, setItem] = useState(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const config = getTokenConfig()
                const response = await axios.get(`${API_URL}/expenses/expense/${expenseId}`, config);
                setItem(response.data);
            } catch (error) {
                console.error('Error fetching expense:', error);
            }
        };

        fetchItem();
    }, [expenseId]);

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

    const handlecancel = async () =>{
        try {
            const config = getTokenConfig()
            await axios.put(`${API_URL}/expenses/update-expense-status/${expenseId}`, {}, config);
            navigate('/expenses');
        } catch (error) {
            console.error('Error updating expense:', error);
        }
    }

    if (!expense) return <div>Loading...</div>;

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full'>
                <div className='flex justify-between border-b border-black pb-1'>
                    <h1 className="text-3xl">{splitText(expense.description)}</h1>
                </div>
                <ExpenseInfo expenseDetails={expense} />
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                {expense.status != 'canceled' && <RightButton name={'Cancel Expense'} onClick={handlecancel}/>}
                <label className='flex items-center gap-1 border-b border-black pb-1 mt-3'>
                    <BsPatchQuestionFill />
                    <h1 className="text-sm">{splitText("Expense Reports")}</h1>
                </label>
                <div>
                    <p className='mb-3'>{splitText("\nIn the expense report the canceled expense doesn't show as expense.")}</p>
                    {/* <strong>{splitText("Facturação por Item\n")}</strong> */}
                </div>
            </div>
        </main>
    );
}

export default ExpenseDetail;