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
