import React, { useState, useEffect } from "react";
import { FaArrowDown, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdLastPage, MdFirstPage  } from "react-icons/md";
import productsData from "../../../constant/productsData";
import { FaSearch } from "react-icons/fa";
import LeftButton from "../../Buttons/LeftButton";

const TableProducts = () => {
    const [products, setProducts] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;
    const [searchValue, setSearchValue] = useState('');

    const fetchPaginatedData = (page) => {
        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedData = productsData.slice(startIndex, endIndex);
        setProducts(paginatedData);
    };

    useEffect(() => {
        fetchPaginatedData(currentPage);
    }, [currentPage]);

    useEffect(() => {
        const sortProducts = (column) => {
            const sorted = [...products].sort((a, b) => {
                let valueA = a[column];
                let valueB = b[column];

                if (column === "Documento" || column === "Número" || column === "Cliente" || column === "ValidoAte") {
                    valueA = String(valueA).toUpperCase();
                    valueB = String(valueB).toUpperCase();
                    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
                    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                } else if (column === "SemImpostoIVA") {
                    if (typeof valueA === 'string') {
                        valueA = parseFloat(valueA.replace(/[^\d.-]/g, ""));
                    }
                    if (typeof valueB === 'string') {
                        valueB = parseFloat(valueB.replace(/[^\d.-]/g, ""));
                    }
                    return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
                }
                return 0;
            });
            setProducts(sorted);
        };

        if (sortColumn) {
            sortProducts(sortColumn);
        }
    }, [sortColumn, sortDirection, products]);

    const handleSort = (column) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const totalPages = Math.ceil(productsData.length / recordsPerPage);

    const handleChangePage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const tableHStyle = "opacity-80 w-1/5 flex items-center gap-1 cursor-pointer text-white";

    const setCurrencyFormat = (amount) => {
        if (String(amount).includes(",")) {
            amount = Number(amount.replace(",", "."));
        }
        const pamount = amount;
        const numberOfDecimals = 2;
        const formattedValue = pamount.toLocaleString("pt", {
            style: "currency",
            currency: "AOA",
            minimumFractionDigits: numberOfDecimals,
            maximumFractionDigits: numberOfDecimals,
        });

        return formattedValue;
    };

    const handleSubimit = (e) =>{
        e.preventDefault();
        console.log('onSubmit')
    }

    return (
        <div className="w-full flex mt-5 flex-col text-gray-900 dark:text-gray-100 text-sm">
            <form onSubmit={handleSubimit} className='flex items-center gap-3 w-full'>
                <div className='relative flex-1'>
                    <input 
                        placeholder='Procure um item' 
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
                >Pesquisar</button>
            </form>
            <div className="flex flex-col">
                <div className="rounded-t-lg dark:border-gray-700 bg-white dark:bg-gray-800 border-b-0 my-6 overflow-y-auto" style={{ height: 'calc(100vh - 296px)' }}>
                    <div className="category-details__header flex items-center gap-5 bg-[#1E1E1E] dark:bg-[#080808] rounded px-4 py-2">
                        <h3 className={`${tableHStyle} ${sortColumn === 'Documento' && 'font-medium'}`} onClick={() => handleSort("Documento")}>
                            Documento{(sortDirection === 'desc' && sortColumn === 'Documento') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'Número' && 'font-medium'}`} onClick={() => handleSort("Número")}>
                            Número{(sortDirection === 'desc' && sortColumn === 'Número') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'Cliente' && 'font-medium'}`} onClick={() => handleSort("Cliente")}>
                            Cliente{(sortDirection === 'desc' && sortColumn === 'Cliente') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'ValidoAte' && 'font-medium'}`} onClick={() => handleSort("ValidoAte")}>
                            Valido até{(sortDirection === 'desc' && sortColumn === 'ValidoAte') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                        <h3 className={`${tableHStyle} ${sortColumn === 'SemImpostoIVA' && 'font-medium'}`} onClick={() => handleSort("SemImpostoIVA")}>
                            Sem Imposto/IVA{(sortDirection === 'desc' && sortColumn === 'SemImpostoIVA') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        </h3>
                    </div>
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-5 rounded px-4 py-2 cursor-pointer ${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            <h3 className="w-1/5">{product.Documento}</h3>
                            <h3 className="w-1/5">{product.Número}</h3>
                            <h3 className="w-1/5">{product.Cliente}</h3>
                            <h3 className="w-1/5">{product.ValidoAte}</h3>
                            <h3 className="w-1/5">{setCurrencyFormat(product.SemImpostoIVA)}</h3>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center rounded-b-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 border-t">
                    <div className="flex items-center gap-1">
                        <h1 className="text-sm">Showing</h1>
                        <h1 className="text-sm font-semibold">{products.length} {products.length > 1 ? 'rows' : 'row'}</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="text-sm flex gap-2 items-center">
                            <button
                                onClick={() => handleChangePage(1)}
                                disabled={currentPage === 1}
                                className={`px-2 py-1 ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-500 cursor-pointer"}`}
                            >
                                <MdFirstPage />
                            </button>
                            <button
                                onClick={() => handleChangePage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-2 py-1 ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-500 cursor-pointer"}`}
                            >
                                <FaChevronLeft />
                            </button>
                            <h1 className="text-xs">{currentPage}</h1>
                            <button
                                onClick={() => handleChangePage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-2 py-1 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-500 cursor-pointer"}`}
                            >
                                <FaChevronRight />
                            </button>
                            <button
                                onClick={() => handleChangePage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`px-2 py-1 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-500 cursor-pointer"}`}
                            >
                                <MdLastPage />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableProducts;