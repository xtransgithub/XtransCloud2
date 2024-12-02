/**
 * AlertModal Component
 * 
 * A reusable modal component for displaying alert messages.
 * The modal overlay captures a click event to close the modal.
 * 
 * Props:
 * - `message` (string): The message to display in the alert modal.
 * - `onClose` (function): Callback function to handle the closing of the modal.
 * 
 * Usage:
 * ```jsx
 * <AlertModal 
 *   message="This is an alert message!" 
 *   onClose={() => setShowModal(false)} 
 * />
 * ```
 */

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
