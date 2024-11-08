import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import RightButton from '../../Buttons/RightButton';
import { useNavigate } from 'react-router-dom';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';

const CloneModal = ({ invoiceId, closeConeModal }) => {
    const navigate = useNavigate();
    const [cloneAs, setCloneAs] = useState('Invoice');

    if(!invoiceId){
        closeConeModal();
    }

    return (
        <div 
            id="modal"
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-15 dark:bg-opacity-50 dark:bg-gray-800"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-15 dark:bg-opacity-50 dark:bg-gray-800 filter blur-xl"></div>
            {/*onClick={closeConeModal} onClick={(e) => e.stopPropagation()} */}
            <div  className="relative">
                <div className="relative flex justify-end">
                    <IoClose size={38} 
                        className={`
                            absolute -top-5 -right-5 border
                            rounded-full shadow-sm p-2 transition-transform duration-5 bg-white
                            active:translate-y-1 cursor-pointer border-gray-300 hover:bg-gray-300 text-[#0B335F]
                            dark:bg-dark-background dark:text-dark-text dark:border-gray-600 dark:hover:bg-gray-700
                        `}
                        onClick={closeConeModal}
                    />
                </div>
                <div className="bg-white shadow-md border-2 border-gray-400 rounded-lg px-10 py-10 pb-12 dark:bg-dark-background dark:border-gray-600">
                    <h1 className="text-center text-xl font-bold mb-3 text-[#0B335F] dark:text-dark-text">
                        Clone as?
                    </h1>
                    <h1 className="text-center text-xs font-bold mb-5 text-[#0B335F] dark:text-dark-text">
                        Select the type of document you want to create
                    </h1>
                    {/* Additional modal content can go here */}
                    <div className='w-80 flex flex-1 flex-wrap justify-around items-center gap-4'>
                        <button className={` flex items-center gap-2 ${cloneAs === 'Invoice' && 'font-bold'}`} type="button" onClick={() => setCloneAs('Invoice')}>
                            {cloneAs === 'Invoice' ?<FaRegCheckCircle className='font-bold text-xl' />:<FaRegCircle />} Invoice
                        </button>
                        <button className={` flex items-center gap-2 ${cloneAs === 'Invoice-Receipt' && 'font-bold'}`} type="button" onClick={() => setCloneAs('Invoice-Receipt')}>
                            {cloneAs === 'Invoice-Receipt' ?<FaRegCheckCircle className='font-bold text-xl' />:<FaRegCircle />} Invoice/Receipt
                        </button>
                        {/* <button className={`w-2/5 flex items-center gap-2 ${cloneAs === 'Delivery' && 'font-bold'}`} type="button" onClick={() => setCloneAs('Delivery')}>
                            {cloneAs === 'Delivery' ?<FaRegCheckCircle className='font-bold' />:<FaRegCircle />} Entrega
                        </button>
                        <button className={`w-2/5 flex items-center gap-2 ${cloneAs === 'Order' && 'font-bold'}`} type="button" onClick={() => setCloneAs('Order')}>
                            {cloneAs === 'Order' ?<FaRegCheckCircle className='font-bold' />:<FaRegCircle />} Encomenda
                        </button> */}
                    </div>
                    <div className='flex justify-end mt-8 gap-4'>
                        <RightButton name={'Clone'} onClick={() => navigate(`/invoices/clone/${invoiceId}/${cloneAs}`)} />
                        <RightButton name={'Cancel'} onClick={closeConeModal}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CloneModal;