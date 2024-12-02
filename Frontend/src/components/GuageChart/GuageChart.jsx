/**
 * GaugeChartComponent
 * 
 * This component renders a gauge chart to visually represent a value as a percentage.
 * It utilizes the `react-gauge-chart` library to create the gauge visualization.
 * 
 * Props:
 * - `value` (number): A numeric value between 0 and 100, representing the percentage to display on the gauge chart.
 * 
 * Example Usage:
 * ```jsx
 * import GaugeChartComponent from './components/GaugeChartComponent/GaugeChartComponent';
 * 
 * function App() {
 *   return <GaugeChartComponent value={75} />;
 * }
 * ```
 * 
 * Features:
 * - The gauge chart dynamically adjusts based on the `value` prop.
 * - Customizable text color to match application styling.
 * - Easy integration into dashboards or other data visualization components.
 * 
 * External Dependencies:
 * - `react-gauge-chart`: A React library for creating customizable gauge charts.
 * - `GuageChart.css`: CSS file for styling the chart container.
 * 
 * Styles:
 * - Ensure `GuageChart.css` provides appropriate styling for seamless integration.
 */

import React from 'react';
import GaugeChart from 'react-gauge-chart';
import './GuageChart.css'

const GaugeChartComponent = ({ value }) => {
  return (
    <div>
      <GaugeChart id="gauge-chart" nrOfLevels={20} percent={value / 100} textColor={'#3246a8'} />
    </div>
  );
};

export default GaugeChartComponent;
