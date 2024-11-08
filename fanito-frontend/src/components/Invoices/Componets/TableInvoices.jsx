import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import productsData from "../../../constant/productsData";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import getTokenConfig from "../../../axiosconfig/config";
import { API_URL } from "../../../constant/config";
import formatDate from "../../../constant/formatDate";

const TableInvoices = ({ invotype }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [selectedCheckBoxes, setSelectedCheckBoxes] = useState([]);
    const [ invotypeof, setInvotypeof] = useState('');

    const fetchInvoices = async (page, search) => {
        try {
            const config = {
                ...getTokenConfig(),
                params: {
                    page,
                    limit: 10, // Assuming 10 records per page
                    search,
                    invotype
                },
            };
            const response = await axios.get(`${API_URL}/invoices/ge-tinvoices`, config);
            // console.log(response.data.invoices)
            setProducts(response.data.invoices);
            setTotalPages(response.data.totalPages);
            // setInvotypeof(invotype === 'Proforma' ? 'Factura Proforma' : invotype === 'Invoice' ? 'Factura' : 'Factura/Recibo');
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    useEffect(() => {
        fetchInvoices(currentPage, searchValue);
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
        fetchInvoices(1, searchValue);
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

    const handleCheckboxChange = (index) => {
        setSelectedCheckBoxes(prevSelected => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter(item => item !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    const handleBulkAction = (action) => {
        // Perform the bulk action based on selectedCheckBoxes and action type
        console.log(`${action} action performed on: `, selectedCheckBoxes);
    };

    const setCurrencyFormat = (amount) => {
        if (String(amount).includes(",")) {
            amount = Number(amount.replace(",", "."));
        }
        const pamount = amount;
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
                        placeholder='Search for an invoice' 
                        type='text' 
                        className='w-full py-2 px-8 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm
                            text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400
                        '
                        value={searchValue}
                        onChange={(e)=>setSearchValue(e.target.value)}
                        name='search'
                        autoComplete="off"
                    />
                    <FaSearch className='absolute z-1 top-[13px] ml-3 text-[0.8rem]'/>
                </div>
                {/* <LeftButton name={'Procurar'} /> */}
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
                        <h3 className={`opacity-80 flex items-center gap-1 cursor-pointer text-white w-1/8`} >
                            <input type="checkbox"
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    if (checked) {
                                        setSelectedCheckBoxes(products.map((item) => item.id));
                                    } else {
                                        setSelectedCheckBoxes([]);
                                    }
                                }}
                                checked={selectedCheckBoxes.length === products.length}
                            />
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'Documento' && 'font-medium'}`} onClick={() => handleSort("Documento")}>
                            Document{(sortDirection === 'desc' && sortColumn === 'Documento') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'Número' && 'font-medium'}`} onClick={() => handleSort("Número")}>
                            Number{(sortDirection === 'desc' && sortColumn === 'Número') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'Cliente' && 'font-medium'}`} onClick={() => handleSort("Cliente")}>
                            Client{(sortDirection === 'desc' && sortColumn === 'Cliente') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'ValidoAte' && 'font-medium'}`} onClick={() => handleSort("ValidoAte")}>
                            Valid Until{(sortDirection === 'desc' && sortColumn === 'ValidoAte') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'SemImpostoIVA' && 'font-medium'}`} onClick={() => handleSort("SemImpostoIVA")}>
                            Without Tax{(sortDirection === 'desc' && sortColumn === 'SemImpostoIVA') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                    </div>
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-5 rounded px-4 py-2 cursor-pointer ${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            <div className="w-1/8">
                                <input type="checkbox" 
                                    checked={selectedCheckBoxes.includes(product.invoice_id)}
                                    onChange={() => handleCheckboxChange(product.invoice_id)}
                                />
                            </div>
                            <div
                                className="w-1/6 flex gap-1 items-center" 
                                onClick={()=>navigate(`${product.document_type === 'Proforma' ?'/proformas/daft':'/invoices/daft'}/${product.invoice_id}`)}
                            >
                                <div 
                                    className={`p-1 border rounded
                                        ${product.total_paid >= product.total_amount ? 'bg-green-300 text-green-900 border-green-900' : 
                                            product.status === 'final' ? 'bg-blue-300 text-blue-900 border-blue-900' : 
                                            product.status === 'canceled' ? 'bg-red-300 text-red-900 border-red-900' : 'bg-yellow-300 text-yellow-900 border-yellow-900'
                                        }
                                    `}
                                >
                                    {product.total_paid >= product.total_amount ? 'P' : product.status === 'final' ? 'F' : product.status === 'canceled' ? 'C' : 'D'}
                                </div>
                                <h3>{product.document_type === 'Proforma' ? 'Proforma Invoice' : product.document_type === 'Invoice' ? 'Invoice' : product.document_type === 'Credit-Note'? `Credit Note` : 'Invoice/Recipt'}</h3>
                            </div>
                            <h3 
                                className="w-1/6"
                                onClick={()=>navigate(`${product.document_type === 'Proforma' ?'/proformas/daft':'/invoices/daft'}/${product.invoice_id}`)}
                            >{product.invoice_code}</h3>
                            <h3 
                                className="w-1/6"
                                onClick={()=>navigate(`${product.document_type === 'Proforma' ?'/proformas/daft':'/invoices/daft'}/${product.invoice_id}`)}
                            >{product.client_name}</h3>
                            <h3
                                className="w-1/6"
                                onClick={()=>navigate(`${product.document_type === 'Proforma' ?'/proformas/daft':'/invoices/daft'}/${product.invoice_id}`)}
                            >{
                                // formatDate(product.document_date)
                                product?.document_date && new Date(product?.document_date).toLocaleDateString()
                            }</h3>
                            <h3 
                                className="w-1/6"
                                onClick={()=>navigate(`${product.document_type === 'Proforma' ?'/proformas/daft':'/invoices/daft'}/${product.invoice_id}`)}
                            >{setCurrencyFormat(product.total_amount)}</h3>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center rounded-b-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 border-t">
                    <div className="flex items-center gap-3">
                        <button 
                            className="px-3 py-1 text-xs rounded shadow transition-all duration-100 ease-in-out bg-[#f1f1f1] dark:bg-black text-black 
                                dark:text-white hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f] active:scale-95 
                                active:shadow-inner border-b border-gray-800 active:border-gray-500 dark:border-gray-600
                            " 
                            type="btn" onClick={() => handleBulkAction("Archive")}
                        >Archive</button>
                        <button 
                            className="px-3 py-1 text-xs rounded shadow transition-all duration-100 ease-in-out bg-[#f1f1f1] dark:bg-black text-black 
                                dark:text-white hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f] active:scale-95 
                                active:shadow-inner border-b border-gray-800 active:border-gray-500 dark:border-gray-600
                            " 
                            type="btn" onClick={() => handleBulkAction("Delete")}
                        >Delete</button>
                        <button 
                            className="px-3 py-1 text-xs rounded shadow transition-all duration-100 ease-in-out bg-[#f1f1f1] dark:bg-black text-black 
                                dark:text-white hover:bg-[#e1e1e1] dark:hover:bg-[#1f1f1f] active:scale-95 
                                active:shadow-inner border-b border-gray-800 active:border-gray-500 dark:border-gray-600
                            " 
                            type="btn" onClick={() => handleBulkAction("Download")}
                        >Download</button>
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
    )
}

export default TableInvoices;