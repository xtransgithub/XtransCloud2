/**
 * LineChartComponent
 *
 * This component renders a line chart using Chart.js to display historical data.
 *
 * Props:
 * @param {Object} data - Contains the data for the chart.
 *   - {Array<number>} series1 - The data points for the chart.
 * @param {Array<string>} timeLabels - The labels for the x-axis, representing time.
 *
 * Usage:
 * <LineChartComponent data={{ series1: [10, 20, 30] }} timeLabels={['1 PM', '2 PM', '3 PM']} />
 *
 * Dependencies:
 * - react
 * - chart.js
 * - react-chartjs-2
 *
 * Styles:
 * Custom styles for the chart are defined in `LineChart.css`.
 */


import React from 'react';
import { Line } from 'react-chartjs-2';
import './LineChart.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChartComponent = ({ data, timeLabels }) => {
  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Data History',
        data: data.series1,
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default LineChartComponent;
