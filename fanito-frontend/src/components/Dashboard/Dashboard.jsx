import React, { useState, useEffect } from 'react';
import MyChart from '../MyCharts/MyCharts';
import LeftButton from '../Buttons/LeftButton';
import MyDashTable from '../MyTables/MyDashTable';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import PieChartContent from './PieChartContent';
import LineChartContent from './LineChartContent';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import axios from 'axios';
import setCurrencyFormat from '../../constant/setCurrencyFormat';
import SplitText from '../splitText/SplitText';

const Dashboard = () => {
    const [totalSales, setTotalSales] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/reportdash/total-sales`, getTokenConfig())
            .then((response) => {
                setTotalSales(response.data.total_sales);
                setLoading(false);
            })
            .catch((error) => {
                setError('Failed to fetch total sales data');
                setLoading(false);
            });
    }, []);

    useGSAP(() => {
        gsap.fromTo('.dashboard_main', {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                delay: 0.05,
                stagger: 0.05,
                onComplete: () =>{
                    shadow: 5
                }
            }
        );
    }, []);

    return (
        <main 
            className="flex gap-14 justify-between px-6 py-8 bg-[#fcfcfc] dark:bg-dark-background text-light-text dark:text-dark-text rounded-2xl"
        >
            <div className='w-full dashboard_main'>
                {/* <h1 className="text-xl">Facturação</h1> */}
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && (
                    <div className="text-5xl">
                        <SplitText text={`${setCurrencyFormat(totalSales)}`} />
                    </div>
                )}
                <div className='flex w-full h-[400px] z-1'>
                    <MyChart />
                </div>
                <div className='w-full mt-12'>
                    <label className='flex items-end mb-3'>
                        <h1 className="text-3xl">
                        {totalSales &&<SplitText text={`Invoices`} />}
                        </h1>
                    </label>
                    <MyDashTable />
                </div>
                <div className='flex gap-20 mt-12'>
                    <PieChartContent />
                    <LineChartContent />
                </div>
            </div>
            <div className='w-[300px] flex flex-col justify-start gap-4'>
                <LeftButton name={'New invoice'} to={'/invoices/new'} />
                <LeftButton name={'New proforma'} to={'/proformas/new'}/>
                {/* <LeftButton name={'Nova guia de transporte'} to={'/guia/new'}/> */}
                <LeftButton name={'New Customer'} to={'/clients/new'}/>
                <LeftButton name={'New item'} to={'/items/new'}/>
                {/* <LeftButton name={'Exportar SAF-T AO'} to={'/reports/saftao/export'}/> */}
            </div>
        </main>
    )
}

export default Dashboard;