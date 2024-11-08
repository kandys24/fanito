// TableClients.jsx
import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import getTokenConfig from "../../../axiosconfig/config";
import { API_URL } from "../../../constant/config";

const TableClients = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchValue, setSearchValue] = useState('');

    const fetchClients = async (page, search) => {
        try {
            const config = {
                ...getTokenConfig(),
                params: {
                    page,
                    limit: 10, // Assuming 10 records per page
                    search,
                },
            };
            const response = await axios.get(`${API_URL}/comclient/clients`, config);
            setClients(response.data.clients);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        fetchClients(currentPage, searchValue);
    }, [currentPage, searchValue]);

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

    const handleSubimit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page when searching
        fetchClients(1, searchValue);
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

    const tableHStyle = "opacity-80 w-1/6 flex items-center gap-1 cursor-pointer text-white";

    return (
        <div className="w-full flex mt-5 flex-col text-gray-900 dark:text-gray-100 text-sm">
            <form onSubmit={handleSubimit} className='flex items-center gap-3 w-full'>
                <div className='relative flex-1'>
                    <input 
                        placeholder='Search for a client' 
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
                        <h3 className={`opacity-80 w-1/3 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'Nome' && 'font-medium'}`} onClick={() => handleSort("Nome")}>
                            Name{(sortDirection === 'desc' && sortColumn === 'Nome') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'Contribuinte' && 'font-medium'}`} onClick={() => handleSort("Contribuinte")}>
                            Taxpayer{(sortDirection === 'desc' && sortColumn === 'Contribuinte') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`opacity-80 w-1/4 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'Email' && 'font-medium'} `} onClick={() => handleSort("Email")}>
                            Email{(sortDirection === 'desc' && sortColumn === 'Email') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`opacity-80 w-1/6 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'Telefone' && 'font-medium'}`} onClick={() => handleSort("Telefone")}>
                            Telephone{(sortDirection === 'desc' && sortColumn === 'Telefone') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`opacity-80 w-1/6 flex items-center gap-1 cursor-pointer text-white ${sortColumn === 'Saldo' && 'font-medium'} `} onClick={() => handleSort("Saldo")}>
                            Balance{(sortDirection === 'desc' && sortColumn === 'Saldo') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                    </div>
                    {clients.map((client, index) => (
                        <div
                            key={index} onClick={()=>navigate(`/clients/details/${client.client_id}`)}
                            className={`flex items-center gap-5 rounded px-4 py-2 cursor-pointer ${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            <h3 className="w-1/3 break-all">{client.name}</h3>
                            <h3 className="w-1/6 break-all">{client.document_number}</h3>
                            <h3 className="w-1/4 break-all">{client.email}</h3>
                            <h3 className="w-1/6 break-all">{client.phone}</h3>
                            <h3 className="w-1/6 break-all">{setCurrencyFormat(client.balance)}</h3>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center rounded-b-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 border-t">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm">Showing</h1>
                        <h1 className="text-sm font-semibold">{clients.length} {clients.length > 1 ? 'rows' : 'row'}</h1>
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
};

export default TableClients;