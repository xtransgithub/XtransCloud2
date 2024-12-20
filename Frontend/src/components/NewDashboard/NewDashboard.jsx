/**
 * ChannelDashboard Component
 *
 * The main dashboard view for a specific channel. It displays channel information,
 * real-time data visualization (gauge and line charts), and options to edit channel details
 * or update its fields.
 *
 * Props:
 * @prop {object} channelData - Contains metadata for the channel such as name, description, and fields.
 * @prop {object} fieldData - The current real-time data for each field in the channel.
 * @prop {object} historicalData - Historical data for each field, used for line charts.
 *
 * State:
 * @state {boolean} isEditing - Tracks whether the user is in editing mode.
 * @state {string} updatedChannelName - Holds the updated name for the channel during editing.
 * @state {Array} updatedFields - Array of objects for tracking field name updates.
 * @state {string} newField - Stores the name of a new field being added during editing.
 * @state {string} fieldToRemove - Stores the name of the field to be removed during editing.
 *
 * Features:
 * - Displays channel details such as name, description, ID, and fields.
 * - Dynamically renders gauge and line charts for each field with real-time data and historical data.
 * - Allows users to edit channel name, rename fields, add new fields, and remove existing fields.
 * - Exports channel data as a CSV file.
 * - Provides an empty state message when no data is available.
 *
 * Functions:
 * @function toggleEdit - Toggles the visibility of the channel editing modal.
 * @function handleChannelUpdate - Saves the updated channel name.
 * @function handleFieldUpdate - Saves the updated field names.
 * @function handleAddField - Adds a new field to the channel.
 * @function handleRemoveField - Removes a specified field from the channel.
 * @function getCSV - Exports the channel data as a CSV file.
 *
 * Usage:
 * <ChannelDashboard
 *   channelData={channelData}
 *   fieldData={fieldData}
 *   historicalData={historicalData}
 * />
 *
 * Styles:
 * Custom styles for the component are defined in `ChannelDashboard.css`.
 */


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GaugeChartComponent from '../GuageChart/GuageChart';
import LineChartComponent from '../LineChart/LineChart';
import FieldDisplay from './FieldDisplay';
import './NewDashboard.css';
import Navbar from '../Navbar/Navbar';
import { useParams } from 'react-router-dom';

const ChannelDashboard = () => {
    const [channelData, setChannelData] = useState({});
    const [currentChannel, setCurrentChannel] = useState({});
    const [fieldData, setFieldData] = useState({});
    const [fieldCounts, setFieldCounts] = useState({});
    const [historicalData, setHistoricalData] = useState({});
    const [isEditing, setIsEditing] = useState(false); // Consolidated edit state
    const [updatedChannelName, setUpdatedChannelName] = useState(''); // For updated channel name
    const [updatedFields, setUpdatedFields] = useState([]);  // For updated field names
    const [newField, setNewField] = useState(''); // New field to be added
    const [fieldToRemove, setFieldToRemove] = useState(''); // Field to be removed
    const { id } = useParams();  // Get the channel ID from the route
    
    const token = localStorage.getItem('token');
    // const server = "http://localhost:4001/";
    const server = "https://xtrans-cloud2.vercel.app/";
    
    useEffect(() => {
        const fetchChannelData = async () => {
            getChannelById();
            try {
                const fieldResponse = await axios.get(`${server}api/channels/${id}/entries/read`);
                
                const allFields = new Set();
                fieldResponse.data.entries.forEach(entry => {
                    entry.fieldData.forEach(field => allFields.add(field.name));
                });
        
                const createdFields = Array.from(allFields);
                
                // Initialize `latestEntry` with default values for each field
                const latestEntry = createdFields.reduce((acc, fieldName) => {
                    acc[fieldName] = 0;
                    return acc;
                }, {});

                const fieldEntryCount = createdFields.reduce((acc, fieldName) => {
                    acc[fieldName] = 0;
                    return acc;
                }, {});
        
                fieldResponse.data.entries.forEach(entry => {
                    entry.fieldData.forEach(field => {
                        latestEntry[field.name] = field.value;
                        fieldEntryCount[field.name] += 1;
                    });
                });
        
                setFieldData(latestEntry);
        
                // Organize historical data by timestamp only when there’s an entry
                const historicalDataResponse = createdFields.reduce((acc, fieldName) => {
                    acc[fieldName] = [];
                    return acc;
                }, {});
        
                fieldResponse.data.entries.forEach(entry => {
                    createdFields.forEach(fieldName => {
                        const field = entry.fieldData.find(f => f.name === fieldName);
                        if (field) {
                            // Add only if there's data for the field at this timestamp
                            historicalDataResponse[fieldName].push({ 
                                value: field.value, 
                                timestamp: entry.timestamp 
                            });
                        }
                    });
                });
        
                setHistoricalData(historicalDataResponse);
                setFieldCounts(fieldEntryCount);
        
                setChannelData({
                    name: fieldResponse.data.channelName || 'Unnamed Channel',
                    description: fieldResponse.data.channelDescription || 'No description provided',
                    fields: createdFields,
                });
            } catch (error) {
                console.error('Error fetching channel data:', error);
            }
        };

            fetchChannelData();
    }, [id]);
    // New function to fetch channels and find by ID
    const getChannelById = async () => {
        try {
            const response = await axios.get(`${server}api/auth/channels`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            
            const allChannels = response.data.channels;
            
            // Find the specific channel by ID
            const matchedChannel = allChannels.find(channel => channel._id === id);
            // console.log(matchedChannel);
            
            // Update state with the found channel
            if (matchedChannel) {
                setCurrentChannel({
                    currentChannelname: matchedChannel.name,
                    currentChannelDesc: matchedChannel.description,
                    currentChannelAPI: matchedChannel.apiKey,
                    currentChannelFields: matchedChannel.fields,
                    currentChannelId: matchedChannel._id,
                    currentChannelUserId: matchedChannel.userId,
                });
            } else {
                console.error('Channel not found');
            }
        } catch (error) {
            console.error('Error fetching specific channel:', error);
        }
    };
    // getChannelById();

    

    console.log(currentChannel.currentChannelFields);

    const getCSV = async () => {
        try {
            const response = await axios.get(
                `${server}api/csv/channels/${id}/fields/csv`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob', // Important to handle the binary data
                }
            );

            // Create a URL for the blob object returned by the API
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `channel_${id}_fields.csv`); // Set the filename
            document.body.appendChild(link);
            link.click(); // Trigger the download
            link.remove(); // Clean up the DOM

        } catch (error) {
            console.error('Error downloading CSV:', error);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        // Set initial values when opening the modal
        setUpdatedChannelName(channelData.name);
        setUpdatedFields(channelData.fields.map(field => ({ oldName: field, newName: field })));
    };

    const handleChannelUpdate = async () => {
        try {
            const response = await axios.patch(
                `${server}api/auth/channels/${id}`,
                { name: updatedChannelName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChannelData(prevData => ({ ...prevData, name: response.data.channel.name }));
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating channel name:', error);
        }
    };

    const fieldPattern = /^[a-z0-9]+$/;

const handleAddField = async () => {
    if (newField.trim()) {
        if (!fieldPattern.test(newField)) {
            alert('Field name can only contain lowercase letters and numbers.');
            return;
        }
        
        try {
            const response = await axios.patch(
                `${server}api/channels/${id}/add-fields`,
                { fields: [newField] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChannelData(prevData => ({ ...prevData, fields: response.data.channel.fields }));
            setNewField('');
            window.location.reload();
        } catch (error) {
            console.error('Error adding new field:', error);
        }
    } else {
        alert('Please enter a valid field name.');
    }
};

const handleFieldUpdate = async () => {
    const confirmUpdate = window.confirm('Are you sure you want to update the field names?');
    if (confirmUpdate) {
        const invalidField = updatedFields.find(({ newName }) => !fieldPattern.test(newName));
        if (invalidField) {
            alert('Field names can only contain lowercase letters and numbers.');
            return;
        }

        try {
            const updatedFieldData = updatedFields.map(({ oldName, newName }) => ({ oldName, newName }));
            const response = await axios.patch(
                `${server}api/channels/${id}/fields`,
                { fields: updatedFieldData },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChannelData(prevData => ({ ...prevData, fields: response.data.channel.fields }));
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error('Error updating field names:', error);
        }
    }
};

const handleRemoveField = async () => {
    if (fieldToRemove.trim()) {
        try {
            // Send DELETE request to remove the specific field
            const response = await axios.delete(
                `${server}api/channels/${id}/fields/${fieldToRemove}`, // Updated endpoint
                { headers: { Authorization: `Bearer ${token}` } } // Authorization header
            );

            console.log(response);

            if (response.status === 200) {
                // Update the local state after successful removal
                setChannelData(prevData => ({
                    ...prevData,
                    fields: prevData.fields.filter(field => field !== fieldToRemove),
                }));

                setFieldData(prevData => {
                    const updatedFieldData = { ...prevData };
                    delete updatedFieldData[fieldToRemove];
                    return updatedFieldData;
                });

                setHistoricalData(prevData => {
                    const updatedHistoricalData = { ...prevData };
                    delete updatedHistoricalData[fieldToRemove];
                    return updatedHistoricalData;
                });

                setFieldToRemove('');
                window.location.reload(); // Optionally refresh the page to reflect changes
            } else {
                console.error('Failed to remove field:', response.data.message);
                alert(response.data.message || 'Failed to remove field.');
            }
        } catch (error) {
            console.error('Error removing field:', error);
            alert(error.response?.data?.message || 'Error occurred while removing field.');
        }
    } else {
        alert('Please enter a valid field name to remove.');
    }
};


    if (!channelData.fields || Object.keys(fieldData).length === 0) {
        return (
            <>
                <Navbar />
                {/* <SecondaryNavbar /> */}
                <div className="dashboard">
                    <div className="empty-state-message">
                        <h2>No Data Available</h2>
                        <p>This channel currently has no entries. Please add data to view the charts.</p>
                    </div>
                    {/* <div className='dashboard-body'> */}
                    <div className="card currentCh">
                        <div className="card-header">
                            <strong>{currentChannel.currentChannelname}</strong>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item"><strong>Description:</strong> {currentChannel.currentChannelDesc}</li>
                            <li className="list-group-item"><strong>Channel ID:</strong> {currentChannel.currentChannelId}</li>
                            <li className="list-group-item"><strong>User ID:</strong> {currentChannel.currentChannelUserId}</li>
                            <li className="list-group-item"><strong>Fields:</strong> {JSON.stringify(currentChannel.currentChannelFields)}</li>
                        </ul>
                        {/* <div className='card-footer'>
                            <button className="btn btn-secondary" onClick={getCSV}>
                                Get CSV
                            </button>
                        </div> */}
                        <div className='card-footer'>
                            <button className="btn btn-secondary" onClick={toggleEdit}>
                                Edit
                            </button>
                        </div>
                    </div>
                    {isEditing && (
                        <>
                            {/* Modal Backdrop */}
                            <div className="modal-backdrop" onClick={() => setIsEditing(false)}></div>

                            {/* Modal Content */}
                            <div className="edit-modal">
                                <h2>Edit Channel Details</h2>

                                {/* Channel Name Edit */}
                                <div className="edit-section">
                                    <label>Channel Name:</label>
                                    <input
                                        type="text"
                                        value={updatedChannelName}
                                        onChange={(e) => setUpdatedChannelName(e.target.value)}
                                    />
                                    <button className="btn btn-primary" onClick={handleChannelUpdate}>
                                        Save Channel Name
                                    </button>
                                </div>

                                {/* Field Update */}
                                <div className="edit-section">
                                    <h3>Update Field Names</h3>
                                    {updatedFields.map(({ oldName, newName }, index) => (
                                        <div className="field-edit-row" key={index}>
                                            <label>{oldName}</label>
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => {
                                                    const newFields = [...updatedFields];
                                                    newFields[index].newName = e.target.value;
                                                    setUpdatedFields(newFields);
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <button className="btn btn-primary" onClick={handleFieldUpdate}>
                                        Save Field Names
                                    </button>
                                </div>

                                {/* Add New Field */}
                                <div className="edit-section">
                                    <h3>Add New Field</h3>
                                    <input
                                        type="text"
                                        value={newField}
                                        onChange={(e) => setNewField(e.target.value)}
                                        placeholder="Enter new field name"
                                    />
                                    <button className="btn btn-primary" onClick={handleAddField}>
                                        Add Field
                                    </button>
                                </div>

                                {/* Remove Field */}
                                <div className="edit-section">
                                    <h3>Remove Field</h3>
                                    <input
                                        type="text"
                                        value={fieldToRemove}
                                        onChange={(e) => setFieldToRemove(e.target.value)}
                                        placeholder="Enter field name to remove"
                                    />
                                    <button className="btn btn-danger" onClick={handleRemoveField}>
                                        Remove Field
                                    </button>
                                </div>

                                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            {/* <SecondaryNavbar /> */}

            <div className="dashboard">
                <div className="channel-info">
                    <h1>{channelData.name}</h1>
                    <p>{channelData.description}</p>
                </div>

                <div className='dashboard-body'>
                    <div className="card currentCh">
                        <div className="card-header">
                            <strong>{currentChannel.currentChannelname}</strong>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item"><strong>Description:</strong> {currentChannel.currentChannelDesc}</li>
                            <li className="list-group-item"><strong>Channel ID:</strong> {currentChannel.currentChannelId}</li>
                            <li className="list-group-item"><strong>User ID:</strong> {currentChannel.currentChannelUserId}</li>
                            <li className="list-group-item"><strong>Fields:</strong> {JSON.stringify(currentChannel.currentChannelFields)}</li>
                        </ul>
                        <div className='card-footer'>
                            <button className="btn btn-secondary" onClick={getCSV}>
                                Export Data
                            </button>
                        </div>
                        <div className='card-footer'>
                            <button className="btn btn-secondary" onClick={toggleEdit}>
                                Edit
                            </button>
                        </div>
                    </div>

                    <div className="charts-container">
                        {channelData.fields.map((field, index) => (
                            <div className="chart" key={index}>
                                <FieldDisplay name={field} value={fieldData[field]} count={fieldCounts[field] || 0} />
                                <GaugeChartComponent value={fieldData[field]} />
                                <LineChartComponent
                                    data={{
                                        series1: historicalData[field]?.map(entry => entry.value) || [],
                                    }}
                                    timeLabels={historicalData[field]?.map(entry => {
                                        const date = new Date(entry.timestamp);
                                        return date.toLocaleTimeString([], { day:'numeric', month:'numeric' ,hour: '2-digit', minute: '2-digit' });
                                        // return date.toISOString([], { day:'numeric', month:'numeric' ,hour: '2-digit', minute: '2-digit' });
                                    }) || []}
                                />
                            </div>
                        ))}
                    </div>
                    {isEditing && (
                        <>
                            {/* Modal Backdrop */}
                            <div className="modal-backdrop" onClick={() => setIsEditing(false)}></div>

                            {/* Modal Content */}
                            <div className="edit-modal">
                                <h2>Edit Channel Details</h2>

                                {/* Channel Name Edit */}
                                <div className="edit-section">
                                    <label>Channel Name:</label>
                                    <input
                                        type="text"
                                        value={updatedChannelName}
                                        onChange={(e) => setUpdatedChannelName(e.target.value)}
                                    />
                                    <button className="btn btn-primary" onClick={handleChannelUpdate}>
                                        Save Channel Name
                                    </button>
                                </div>

                                {/* Field Update */}
                                <div className="edit-section">
                                    <h3>Update Field Names</h3>
                                    {updatedFields.map(({ oldName, newName }, index) => (
                                        <div className="field-edit-row" key={index}>
                                            <label>{oldName}</label>
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => {
                                                    const newFields = [...updatedFields];
                                                    newFields[index].newName = e.target.value;
                                                    setUpdatedFields(newFields);
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <button className="btn btn-primary" onClick={handleFieldUpdate}>
                                        Save Field Names
                                    </button>
                                </div>

                                {/* Add New Field */}
                                <div className="edit-section">
                                    <h3>Add New Field</h3>
                                    <input
                                        type="text"
                                        value={newField}
                                        onChange={(e) => setNewField(e.target.value)}
                                        placeholder="Enter new field name"
                                    />
                                    <button className="btn btn-primary" onClick={handleAddField}>
                                        Add Field
                                    </button>
                                </div>

                                {/* Remove Field */}
                                <div className="edit-section">
                                    <h3>Remove Field</h3>
                                    <input
                                        type="text"
                                        value={fieldToRemove}
                                        onChange={(e) => setFieldToRemove(e.target.value)}
                                        placeholder="Enter field name to remove"
                                    />
                                    <button className="btn btn-danger" onClick={handleRemoveField}>
                                        Remove Field
                                    </button>
                                </div>

                                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChannelDashboard;
