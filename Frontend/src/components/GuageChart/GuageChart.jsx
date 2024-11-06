import React from 'react';
import GaugeChart from 'react-gauge-chart';
import './GuageChart.css'

const GaugeChartComponent = ({ value }) => {
  return (
    <div>
      <GaugeChart id="gauge-chart" nrOfLevels={20} percent={value / 100} />
    </div>
  );
};

export default GaugeChartComponent;
