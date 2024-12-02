/**
 * FieldDisplay Component
 *
 * A simple component for displaying field information, including the field name,
 * its current value, and the total number of entries.
 *
 * Props:
 * @prop {string} name - The name of the field.
 * @prop {string | number} value - The current reading/value of the field.
 * @prop {number} count - The total count of entries for the field.
 *
 * Features:
 * - Dynamically displays field-specific details.
 * - Styled using the associated `FieldDisplay.css` file.
 *
 * Usage:
 * <FieldDisplay name="Temperature" value="25°C" count={10} />
 *
 * Styles:
 * Custom styles for the component are defined in `FieldDisplay.css`.
 */


import React from 'react';
import './FieldDisplay.css';

const FieldDisplay = ({ name, value, count }) => {
  return (
    <div className="field-display">
      <h4>Field: {name}</h4>
      <p>Current Reading: {value}</p>
      <p>Entries Count: {count}</p>
    </div>
  );
};

export default FieldDisplay;
