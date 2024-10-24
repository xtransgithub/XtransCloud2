// FieldDisplay.js
import React from 'react';
import './FieldDisplay.css';

const FieldDisplay = ({ name, value }) => {
  return (
    <div className="field-display">
      <h4>Field: {name}</h4>
      <p>Current Reading: {value}</p>
    </div>
  );
};

export default FieldDisplay;
