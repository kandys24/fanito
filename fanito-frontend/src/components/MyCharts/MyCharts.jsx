import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import getTokenConfig from '../../axiosconfig/config';
import { API_URL } from '../../constant/config';

// Register required components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Register the datalabels plugin
);

const MyChart = () => {
  const [chartData, setChartData] = useState(null); // State to store fetched data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Sales',
        data: [5000000, 6000000, 8000000, 7000000, 6000000, 5558900, 7777775],
        backgroundColor: 'rgba(75, 192, 192, 1)', // Solid color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 10, // Rounds the top of the bars
        borderSkipped: false, // Applies rounding to the entire bar
      },
    ],
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`${API_URL}/reportdash/sales-data`, getTokenConfig());
        const data = response.data;
        setChartData({
          labels: data.labels, // Months
          datasets: [
            {
              label: 'Vendas',
              data: data.data, // Total sales for each month
              backgroundColor: 'rgba(75, 192, 192, 1)', // Solid color
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              borderRadius: 10, // Rounds the top of the bars
              borderSkipped: false, // Applies rounding to the entire bar
            },
          ],
        });
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setError('Failed to load chart data');
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchSalesData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to fill its container both width and height
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: false,
        text: 'Monthly Sales Data',
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: 'black',
        font: {
          weight: 'bold',
        },
        formatter: (value) => value, // Format the data label to show the value
      },
    },
    layout: {
      padding: {
        top: 30, // Adds a gap between the chart and the legend
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)', // Fainter grid lines
        },
        ticks: {
          display: false, // Removes y-axis labels
        },
      },
      x: {
        grid: {
          drawBorder: false,
          display: false, // Removes x-axis grid lines
        },
      },
    },
  };

  return (
    <div className="relative w-full h-full">
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default MyChart;
