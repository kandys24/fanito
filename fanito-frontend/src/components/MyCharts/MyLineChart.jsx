import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import gsap from 'gsap';
import axios from 'axios';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';

// Register required components and plugins
ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler // Register the filler plugin for area charts
);

const MyLineChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/reportdash/top-sales`, getTokenConfig())
            .then((response) => {
                const { labels, datasets } = response.data;
                setChartData({
                    labels,
                    datasets
                });
                setLoading(false);
            })
            .catch((error) => {
                setError('Failed to fetch chart data');
                setLoading(false);
            });
    }, []);

    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Posto Media Tensao',
                data: [5000000, 6000000, 8000000, 7000000, 6000000, 5558900, 7777775],
                fill: true,
                tension: 0.3, // Adjust tension for a wavy effect
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    
                    if (!chartArea) return null;
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.7)');
                    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');
                    return gradient;
                },
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointRadius: 1, // Remove point radius
            },
            {
                label: 'Filtro de Agua',
                data: [7000000, 8000000, 7500000, 6500000, 7000000, 8100000, 8500000],
                fill: true,
                tension: 0.3, // Adjust tension for a wavy effect
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    
                    if (!chartArea) return null;
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(153, 102, 255, 0.7)');
                    gradient.addColorStop(1, 'rgba(153, 102, 255, 0.1)');
                    return gradient;
                },
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                pointRadius: 1, // Remove point radius
            },
            {
                label: 'Luminei RGB',
                data: [3000000, 4000000, 3500000, 5000000, 4500000, 3900000, 4100000],
                fill: true,
                tension: 0.3, // Adjust tension for a wavy effect
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    
                    if (!chartArea) return null;
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(255, 159, 64, 0.7)');
                    gradient.addColorStop(1, 'rgba(255, 159, 64, 0.1)');
                    return gradient;
                },
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2,
                pointRadius: 1, // Remove point radius
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
                position: 'bottom', // Position legend outside on the left
                align: 'center',
                labels: {
                    usePointStyle: true, // Use a circle for the legend icon
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                displayColors: true, // Remove color indicators in the tooltip
                // callbacks: {
                //     label: () => '', // Remove the label text from the tooltip
                // },
            },
            datalabels: {
              display: false, // Disable data labels
            },
        },
        scales: {
            x: {
                type: 'category',
                grid: {
                    display: false,
                },
            },
            y: {
                type: 'linear',
                beginAtZero: true,
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                },
                ticks: {
                    display: false, // Remove y-axis labels
                    callback: (value) => {
                        return `$${(value / 1000000).toFixed(1)}M`;
                    },
                },
            },
        },
        animation: {
            duration: 2000,
            easing: 'easeOutQuart',
            from: 0,
            loop: false,
            animateScale: true,
            animateRotate: false,
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return (
        <div className="relative w-full h-full">
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {chartData && <Line data={chartData} options={options} />}
        </div>
    );
};

export default MyLineChart;
