import React from 'react';
import './Alert.css';

const AlertModal = ({ message, onClose }) => {
  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal">
        <p>{message}</p>
        <button onClick={onClose} className="alert-modal-close-btn">OK</button>
      </div>
    </div>
  );
};

export default AlertModal;
