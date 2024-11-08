import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import { API_URL } from '../../../constant/config';
import axios from 'axios';
import getTokenConfig from '../../../axiosconfig/config';
import Notifications from '../../Notifications/Notifications';
import setCurrencyFormat from '../../../constant/setCurrencyFormat';

const styleinput = `w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 text-xs
    `;

const TableProductClone = ({ carts, setCarts, total, setTotal, isToShowNotify }) => {
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [totalsArray, setTotalsArray] = useState([]);
    const [taxes, setTaxes] = useState(null);

    const handleChange = (e) => {
        setSearchValue(e.target.value);
    };

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
        if (searchValue) {
            const fetchItems = async () => {
                try {
                    const config = {
                        ...getTokenConfig(),
                        params: {
                            search: searchValue
                        },
                    };
                    const response = await axios.get(`${API_URL}/comitems/filter-items`, config);
                    const itemsWith = response.data.items.map(item => ({
                        ...item,
                        qtd: 1,
                        desconto: 0
                    }));
                    // console.log(itemsWith)
                    setSuggestions(itemsWith);
                } catch (error) {
                    console.error('Error fetching items:', error);
                }
            };
            fetchItems();
        } else {
            setSuggestions([]);
        }
    }, [searchValue]);

    useEffect(() => {
        // Calculate totals whenever the carts change
        const calculateTotals = () => {
            let sum = 0;
            let discount = 0;
            let retention = 0;
            let withoutTax = 0;
            let tax = 0;

            // New object to store the incidence and corresponding tax for each tax rate (Taxa14, Isento)
            const totalsArray = {};

            carts.forEach(item => {
                const price = parseFloat(item.unit_price) || 0;
                const quantity = parseFloat(item.qtd) || 0;
                const itemTotal = price * quantity;
                
                const itemDiscount = ((parseFloat(item.desconto) || 0) / 100) * itemTotal;
                const itemTaxRate = parseFloat(item.tax_rate) || 0;
                const itemIncidence = itemTotal - itemDiscount;
                const itemTax = (itemTaxRate / 100) * itemIncidence;

                sum += itemTotal;
                discount += itemDiscount;
                withoutTax += itemTotal;
                tax += itemTax;

                // Identify the tax category (Taxa14, Isento) and accumulate the values
                const taxCategory = itemTaxRate > 0 ? `Taxa${itemTaxRate} (${itemTaxRate}%)` : `Isento (0%)`;

                if (!totalsArray[taxCategory]) {
                    totalsArray[taxCategory] = {
                        incidence: 0,
                        taxAmount: 0
                    };
                }

                totalsArray[taxCategory].incidence += itemIncidence;
                totalsArray[taxCategory].taxAmount += itemTax;
            });

            // Convert totalsArray into a proper array with formatted numbers (without currency symbols)
            const formattedTotalsArray = Object.keys(totalsArray).map(taxCategory => ({
                taxRate: taxCategory,
                incidence: totalsArray[taxCategory].incidence, // Incidência (total without tax)
                taxAmount: totalsArray[taxCategory].taxAmount // Valor (tax amount)
            }));

            // console.log(formattedTotalsArray)

            const totalWithTax = withoutTax + tax - discount;

            // Set the totals for the entire cart
            setTotal({
                sum: sum,
                discount: discount,
                withoutTax: withoutTax - discount,
                tax: tax,
                totalWithTax: totalWithTax,
                totalTax: tax
            });

            // Log or store the formatted totals array
            // console.log(formattedTotalsArray);
            setTotalsArray(formattedTotalsArray); // If you want to store the array in state
        };

        calculateTotals();
    }, [carts]);

    const handleSelect = (item) => {
        const itemExists = carts.some(cartItem => cartItem.code === item.code);

        if (!itemExists) {
            setCarts((prevState) => [...prevState, item]);
        }

        setSearchValue(''); // Clear search input
        setSuggestions([]); // Hide suggestions
    };

    const handRemove = (code) => {
        setCarts((prevState) => prevState.filter(item => item.code !== code));
    };

    const handleInputChange = (index, field, value) => {
        const updatedCart = [...carts];
        updatedCart[index][field] = value;
        if(field === 'tax_rate'){
            if(Number(value) === 0){
                const exemptionReason = carts.find(cart => 
                    typeof cart.exemption_reason === 'string' && 
                    cart.exemption_reason !== '' && 
                    cart.exemption_reason !== '0'
                )?.exemption_reason || 'Transmissão de bens e serviço não sujeita';
    
                updatedCart[index]['exemption_reason'] = exemptionReason;
            } else if(Number(value) > 0){
                // console.log(Number(value) > 0)
                updatedCart[index]['exemption_reason'] = '';
            }
        }
        // console.log(updatedCart[index]['exemption_reason'])
        setCarts(updatedCart);
    };

    const handleSelectChange = (index, value) => {
        handleInputChange(index, 'tax_rate', value);
    };

    useGSAP(() => {
        gsap.fromTo('#myTableProduct_main', {
            opacity: 0,
            y: 20,
        }, {
            opacity: 1,
            y: 0,
            delay: 0.5,
            stagger: 0.05,
        });
    }, []);

    return (
        <div id='myTableProduct_main' className='mt-5 bg-white py-5 px-5 pb-10 dark:bg-[#0E0E0E] rounded-xl shadow'>
            <div className='flex justify-between'>
                <h1 className='text-lg'>Items</h1>
            </div>
            <div className="w-full text-md mb-1.5 pb-1 mt-5">
                <div className="flex gap-2 py-1.5 pb-0.5 mb-1 bg-[#1E1E1E] dark:bg-[#080808] text-white text-sm rounded">
                    {/* Header Row */}
                    <div className="w-20 pl-3">Code</div>
                    <div className="flex-1 text-center">Description</div>
                    <div className="flex-1 text-center">Unit Price</div>
                    <div className="w-20 text-center">Qty.</div>
                    <div className="w-20 text-center">Tax/VAT</div>
                    <div className="w-16 text-center">Disc.%</div>
                    <div className="flex-1 text-center">Total</div>
                    <div className="w-8 px-2 mr-4"></div>
                </div>
                {carts?.map((product, index) => (
                    <div key={index} className={`mb-2`}>
                        {/* Product Details Row */}
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="max-w-20">
                                <input
                                    type="text"
                                    value={product.code}
                                    disabled
                                    className={styleinput}
                                />
                            </div>
                            <div className="flex-1 text-center">
                                <input
                                    type="text"
                                    value={product.description}
                                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                    className={styleinput}
                                />
                            </div>
                            <div className="flex-1 text-center">
                                <input
                                    type="number"
                                    value={product.unit_price}
                                    onChange={(e) => handleInputChange(index, 'unit_price', e.target.value)}
                                    className={styleinput}
                                />
                            </div>
                            <div className="w-20 text-center">
                                <input
                                    type="number"
                                    value={product.qtd}
                                    onChange={(e) => handleInputChange(index, 'qtd', e.target.value)}
                                    className={styleinput}
                                />
                            </div>
                            <div className="w-20 text-center">
                                <select
                                    value={Number(product.tax_rate)?.toFixed(2)}
                                    onChange={(e) => handleSelectChange(index, e.target.value)}
                                    className={styleinput}
                                >
                                    {taxes && taxes.map((tax, index)=><option key={index} value={tax.value.toFixed(2)}>{`${tax.value.toFixed(2)}% - ${tax.name}`}</option>)}
                                </select>
                            </div>
                            <div className="w-16 text-center">
                                <input
                                    type="number"
                                    value={product.desconto}
                                    onChange={(e) => handleInputChange(index, 'desconto', e.target.value)}
                                    className={styleinput}
                                />
                            </div>
                            <div className="flex-1 text-center">
                                <input
                                    type="text"
                                    value={((product.qtd*product.unit_price - ((parseFloat(product.desconto) || 0) / 100) * product.qtd*product.unit_price) * (1 + product.tax_rate/100) ).toFixed(2)}
                                    className={styleinput}
                                    readOnly
                                />
                            </div>
                            <div className="w-8 px-2 mr-4">
                                <IoIosClose 
                                    className='rounded-xl shadow transition-all duration-200 ease-in-out active:scale-90 active:shadow-inner cursor-pointer text-red-600' 
                                    onClick={()=>handRemove(product.code)} size={30} 
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <div className='relative mt-4'>
                    <div className='relative'>
                        <input 
                            placeholder='Search for a product' 
                            type='text' 
                            className='w-full py-2 px-8 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs
                                text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400
                            '
                            value={searchValue} 
                            onChange={handleChange} 
                            name='search'
                            autoComplete="off"
                        />
                        <FaSearch className='absolute z-1 top-[10px] ml-3 text-[0.8rem]'/>
                    </div>
                    {/* Suggestions List */}
                    {suggestions.length > 0 && (
                        <ul className="absolute bg-white dark:bg-[#0e0e0e] text-sm shadow-lg rounded-lg w-full max-h-72 overflow-y-auto z-10">
                            {suggestions.map((cart, index) => (
                                <li key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <button 
                                        type="button" 
                                        onClick={() => handleSelect(cart)} 
                                        className="block w-full text-left py-2 px-4 text-gray-900 dark:text-gray-100"
                                    >
                                        {cart.code} - {cart.description}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className='flex gap-12 mt-10'>
                <div id='myTableProduct_main' className='flex-1 text-sm'>
                    <div className="flex gap-2 py-1.5 pb-0.5 mb-1 bg-[#1E1E1E] dark:bg-[#080808] text-white rounded">
                        {/* Header Row */}
                        <div className="flex-1 py-0.5 pl-3">Taxa/IVA</div>
                        <div className="flex-1 py-0.5 text-center">Incidence</div>
                        <div className="flex-1 py-0.5 text-end pr-3">Amount</div>
                    </div>
                    {totalsArray&&<div className={`mb-2`}>
                        {/* Product Details Row */}
                        {totalsArray?.map((item, i)=><div key={i} className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">{item.taxRate}</div>
                            <div className="flex-1 py-0.5 text-center">{setCurrencyFormat(item.incidence)}</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(item.taxAmount)}</div>
                        </div>)}
                    </div>}
                </div>
                <div id='myTableProduct_main' className='flex-1 text-sm'>
                    <div className="flex gap-2 py-1.5 pb-0.5 mb-1 bg-[#1E1E1E] dark:bg-[#080808] text-white rounded">
                        {/* Header Row */}
                        <div className="w-20 py-0.5 pl-3">Summary</div>
                        <div className="flex-1 py-0.5 text-end"></div>
                    </div>
                    <div className={`mb-2`}>
                        {/* Product Details Row */}
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Sum:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(total.sum)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Discount:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(total.discount)}</div>
                        </div>
                        {/* <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Retention:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(total.retention)}</div>
                        </div> */}
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">No Tax/VAT:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(total.withoutTax)}</div>
                        </div>
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className="flex-1 py-0.5 pl-3">Tax/VAT:</div>
                            <div className="flex-1 py-0.5 text-end pr-3">{setCurrencyFormat(total.totalTax)}</div>
                        </div>
                    </div>
                    <div className="flex gap-2 py-1.5 pb-0.5 mb-1 border-t border-black">
                        {/* Header Row */}
                        <div className="w-20 py-0.5 pl-3 font-bold">Total:</div>
                        <div className="flex-1 py-0.5 text-end pr-3 font-bold">{setCurrencyFormat(total.totalWithTax)}</div>
                    </div>
                    {/* {showNoty && showNoty?.map((showNot, i)=><NotyQuanty
                        length={showNoty.length} i={i}
                        key={showNot.id}
                        message={showNot?.message}
                        show={showNot?.show}
                        onClose={()=>handleClose(showNot.id)}
                    />)} */}
                    <Notifications isToShowNotify={isToShowNotify} carts={carts} />
                </div>
            </div>
        </div>
    );
}

export default TableProductClone;