import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import getTokenConfig from "../../../axiosconfig/config";
import { API_URL } from "../../../constant/config";
import formatDate from "../../../constant/formatDate";
import setCurrencyFormat from "../../../constant/setCurrencyFormat";

const TableExpenses = ({ newExpenseModal }) => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchValue, setSearchValue] = useState('');

    const fetchItems = async (page, search) => {
        try {
            const config = {
                ...getTokenConfig(),
                params: {
                    page,
                    limit: 10,
                    search,
                },
            };
            const response = await axios.get(`${API_URL}/expenses/expenses`, config);
            setExpenses(response.data.expenses);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    useEffect(() => {
        fetchItems(currentPage, searchValue);
    }, [currentPage, searchValue, newExpenseModal]);

    const handleSort = (column) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handleChangePage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const tableHStyle = "opacity-80 w-1/6 flex items-center gap-1 cursor-pointer text-white";

    const handleSubimit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page when searching
        fetchItems(1, searchValue);
    };

    const getPageNumbers = () => {
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        if (endPage - startPage < 2) {
            if (startPage > 1) startPage -= 1;
            else if (endPage < totalPages) endPage += 1;
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="w-full flex mt-5 flex-col text-gray-900 dark:text-gray-100 text-sm">
            <form onSubmit={handleSubimit} className='flex items-center gap-3 w-full'>
                <div className='relative flex-1'>
                    <input 
                        placeholder='Search for expense' 
                        type='text' 
                        className='w-full py-2 px-8 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm
                            text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400
                        '
                        value={searchValue}
                        onChange={(e)=>{setSearchValue(e.target.value); setCurrentPage(1);}}
                        name='search'
                        autoComplete="off"
                    />
                    <FaSearch className='absolute z-1 top-[13px] ml-3 text-[0.8rem]'/>
                </div>
                <button 
                    className="px-4 py-2 text-sm rounded-lg shadow transition-all duration-100 ease-in-out bg-[#f1f1f1] dark:bg-black text-black 
                        dark:text-white hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f] active:scale-95 
                        active:shadow-inner border-b border-gray-800 active:border-gray-500 dark:border-gray-600
                    " 
                    type="submit"
                >Search</button>
            </form>
            <div className="flex flex-col mt-6">
                <div className="rounded-t-lg dark:border-gray-700 bg-white dark:bg-gray-800 border-b-0 overflow-y-auto" style={{ height: 'calc(100vh - 387px)' }}>
                    <div className="category-details__header flex items-center gap-5 bg-[#1E1E1E] dark:bg-[#080808] rounded px-4 py-2">
                        <h3 className={`w-1/12 opacity-80 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'Codigo' && 'font-medium'}`} onClick={() => handleSort("Codigo")}>
                            Code{(sortDirection === 'desc' && sortColumn === 'Codigo') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`w-1/4 opacity-80 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'Descricao' && 'font-medium'}`} onClick={() => handleSort("Descricao")}>
                            Description{(sortDirection === 'desc' && sortColumn === 'Descricao') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`w-1/4 opacity-80 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'PrecoUnitario' && 'font-medium'} `} onClick={() => handleSort("PrecoUnitario")}>
                            Unit Price{(sortDirection === 'desc' && sortColumn === 'PrecoUnitario') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`w-1/5 opacity-80 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'payment_method' && 'font-medium'}`} onClick={() => handleSort("payment_method")}>
                            Payment Method{(sortDirection === 'desc' && sortColumn === 'payment_method') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`w-1/6 opacity-80 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'created_at' && 'font-medium'} `} onClick={() => handleSort("created_at")}>
                            Date{(sortDirection === 'desc' && sortColumn === 'created_at') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`w-1/12 opacity-80 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'created_at' && 'font-medium'} `} onClick={() => handleSort("created_at")}>
                            Status{(sortDirection === 'desc' && sortColumn === 'created_at') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                    </div>
                    {expenses.map((item, index) => (
                        <div
                            key={index} onClick={()=>navigate(`/expenses/details/${item.expense_id}`)}
                            className={`flex items-center gap-5 rounded px-4 py-2 cursor-pointer ${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            <h3 className="w-1/12 break-all">{item.expense_code}</h3>
                            <h3 className="w-1/4 break-all">{item.description}</h3>
                            <h3 className="w-1/4 break-all">{setCurrencyFormat(item.amount)}</h3>
                            <h3 className="w-1/5 break-all">{item.payment_method}</h3>
                            <h3 className="w-1/6 break-all">{formatDate(item.created_at)}</h3>
                            <div className="w-1/12 break-all">
                                <div 
                                    className={`p-1 border rounded text-center
                                        ${
                                            item.status === 'final' ? 'bg-blue-300 text-blue-900 border-blue-900' : 
                                            item.status === 'canceled' ? 'bg-red-300 text-red-900 border-red-900' : 'bg-yellow-300 text-yellow-900 border-yellow-900'
                                        }
                                    `}
                                >
                                    {item.status === 'final' ? 'F' : item.status === 'canceled' ? 'C' : 'R'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center rounded-b-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 border-t">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm">Showing</h1>
                        <h1 className="text-sm font-semibold">{expenses.length} {expenses.length > 1 ? 'rows' : 'row'}</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="text-sm flex gap-2 items-center">
                        <button
                                onClick={() => handleChangePage(1)}
                                disabled={currentPage === 1}
                                className={`text-xs rounded-md px-2 py-2 ${currentPage === 1 ? "text-gray-500 bg-gray-200 dark:bg-gray-600" : "font-medium dark:font-bold text-black bg-gray-300 dark:bg-gray-700 cursor-pointer"}`}>
                                First
                            </button>
                            <button
                                onClick={() => handleChangePage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`text-sm rounded-md p-2 ${currentPage === 1 ? "text-gray-500 bg-gray-200 dark:bg-gray-600" : "font-medium dark:font-bold text-black bg-gray-300 dark:bg-gray-700 cursor-pointer"}`}>
                                <FaChevronLeft />
                            </button>
                            {pageNumbers.map((number) => (
                                <button
                                    key={number}
                                    onClick={() => handleChangePage(number)}
                                    className={`text-xs rounded-md px-2 py-1 ${currentPage === number ? "font-bold text-black bg-gray-400 dark:bg-gray-500" : "font-medium dark:font-bold text-black bg-gray-300 dark:bg-gray-700 cursor-pointer"}`}>
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => handleChangePage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`text-sm rounded-md p-2 ${currentPage === totalPages ? "text-gray-500 bg-gray-200 dark:bg-gray-600" : "font-medium dark:font-bold text-black bg-gray-300 dark:bg-gray-700 cursor-pointer"}`}>
                                <FaChevronRight />
                            </button>
                            <button
                                onClick={() => handleChangePage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`text-xs rounded-md px-2 py-2 ${currentPage === totalPages ? "text-gray-500 bg-gray-200 dark:bg-gray-600" : "font-medium dark:font-bold text-black bg-gray-300 dark:bg-gray-700 cursor-pointer"}`}>
                                Last
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TableExpenses;