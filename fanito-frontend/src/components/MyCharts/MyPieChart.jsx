import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';
import setCurrencyFormat from '../../constant/setCurrencyFormat';

// Register required components and plugins
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    ChartDataLabels // Register the datalabels plugin
);

const MyPieChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/reportdash/top-clients`, getTokenConfig())
            .then((response) => {
                const { labels, data } = response.data;
                // console.log(labels)
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Sales',
                            data,
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(153, 102, 255, 0.6)',
                                'rgba(255, 159, 64, 0.6)',
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(255, 206, 86, 0.6)',
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(54, 162, 235, 0.6)',
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(54, 162, 235, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
                setLoading(false);
            })
            .catch((error) => {
                setError('Failed to fetch chart data');
                setLoading(false);
            });
    }, []);

    const data = {
        labels: ['Dufat', 'Something', 'Raa Lda', 'LPa Negocios', 'Compras LDA', 'EMS Contact', 'EMES SURE'],
        datasets: [
        {
            label: 'Sales',
            data: [5000000, 6000000, 8000000, 7000000, 6000000, 5558900, 7777775],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 99, 132, 0.6)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                bottom: 30, // Add padding to the bottom to prevent cutting
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'start',
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                color: 'black',
                font: {
                    weight: 'bold',
                },
                formatter: (value) => {
                    // Format the value as a currency
                    return `${setCurrencyFormat(value)}`;
                },
            },
        },
        hoverOffset: 30, // Increase the size of the slice on hover
        animation: {
            animateRotate: true, // Rotate animation
            animateScale: true, // Scale animation
            duration: 2000, // Animation duration in milliseconds
            // loop: true,
            easing: 'easeInOutBounce', // Easing function for the animation
        },
        onHover: (event, chartElement) => {
            if (chartElement.length) {
                event.native.target.style.cursor = 'pointer'; // Change cursor to pointer on hover
            } else {
                event.native.target.style.cursor = 'default'; // Reset cursor when not hovering
            }
        },
    };

    return (
        <div className="relative w-full h-full">
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {chartData && <Pie data={chartData} options={options} />}
        </div>
    );
};

export default MyPieChart;
