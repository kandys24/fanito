import React, { useEffect, useState } from 'react';
import { IoAddOutline } from "react-icons/io5";
import { MdOutlineDone } from "react-icons/md";
import axios from 'axios';
import getTokenConfig from '../../../axiosconfig/config';
import { API_URL } from '../../../constant/config';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const TaxesDetails = ({ taxes, setTaxes, isToUpdate, setIsToUpdate }) => {
    const [newTax, setNewTax] = useState({ taxName: '', rate: '' });
    const [showAddTax, setShowAddTax] = useState(false);

    const handleAddTax = () => {
        const newId = taxes.length ? taxes[taxes.length - 1].id + 1 : 1;
        const newTaxData = { ...newTax, id: newId, defaultValue: false };
        setTaxes([newTaxData, ...taxes]);  // Add the new tax at the beginning
        setNewTax({ taxName: '', rate: '' });
        setShowAddTax(false);
        setIsToUpdate(true);
    };

    const handleDeleteTax = async (taxId) => {
        try {
            const config = getTokenConfig();
            await axios.delete(`${API_URL}/taxes/delete-tax/${taxId}`, config);
            setTaxes(taxes.filter(tax => tax.id !== taxId));
            setIsToUpdate(false);
        } catch (error) {
            console.error('Error deleting tax:', error);
            alert('Failed to delete tax');
        }
    };

    const handleSetDefault = (taxId) => {
        setTaxes(taxes.map(tax =>
            tax.id === taxId
                ? { ...tax, defaultValue: true }
                : { ...tax, defaultValue: false }
        ));
        setIsToUpdate(true);
    };

    useGSAP(() => {
        gsap.fromTo('#myTaxesDetails_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });
    }, []);

    useEffect(()=>{
        if(!isToUpdate){
        }

    }, [isToUpdate])

    return (
        <div id='myTaxesDetails_main' className="mt-5 bg-white dark:bg-[#0E0E0E] p-6 rounded-xl shadow">
            <h2 className="text-xl mb-4">Taxes/VAT</h2>
            <h3 className="text-lg mb-2">Item tax</h3>
            <table className="w-full text-left mb-4">
                <thead>
                    <tr>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Value</th>
                        <th className="pb-2">Default</th>
                        <th className="pb-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {taxes.map((tax) => (
                        <tr key={tax.id}>
                            <td className="py-2">{tax.taxName}</td>
                            <td className="py-2">{tax.rate}%</td>
                            <td className="py-2">
                                {tax.defaultValue ? (
                                    <MdOutlineDone className='text-xl' />
                                ) : (
                                    <button
                                        onClick={() => handleSetDefault(tax.id)}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Predefinir
                                    </button>
                                )}
                            </td>
                            <td className="py-2">
                                <button
                                    onClick={() => handleSetDefault(tax.id)}
                                    className="underline mr-2"
                                >
                                    Edit
                                </button>
                                {!tax.defaultValue && (
                                    <button
                                        onClick={() => handleDeleteTax(tax.id)}
                                        className="underline"
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {showAddTax && (
                        <tr className="">
                            <td className="py-2">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                    value={newTax.taxName}
                                    onChange={(e) => setNewTax({ ...newTax, taxName: e.target.value })}
                                />
                            </td>
                            <td className="py-2">
                                <input
                                    type="text"
                                    placeholder="Value"
                                    className="py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                    value={newTax.rate}
                                    onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
                                />
                            </td>
                            <td className="py-2"></td>
                            <td className="py-2"></td>
                        </tr>
                    )}
                </tbody>
            </table>

            {!showAddTax && (
                <button
                    onClick={() => setShowAddTax(true)}
                    className='text-sm py-3 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-95 active:shadow-inner flex items-center'
                >
                    <IoAddOutline className='text-xl' /> New tax
                </button>
            )}

            {showAddTax && (
                <button
                    onClick={handleAddTax}
                    className='mt-3 text-sm py-2 px-4 rounded-lg shadow transition-all duration-100 ease-in-out border-b border-gray-800 dark:border-gray-600
                        bg-[#f1f1f1] dark:bg-black 
                        text-black dark:text-white 
                        hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f]
                        active:scale-95 active:shadow-inner flex items-center
                        text-white bg-gray-600 shadow border-b-2 hover:bg-gray-700 dark:bg-gray-900
                        '
                >
                    <IoAddOutline className='text-xl' /> Add tax
                </button>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Default Tax - This is the tax that, by default, will be applied to created items.
            </p>
        </div>
    );
};

export default TaxesDetails;
