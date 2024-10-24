import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GaugeChartComponent from '../GuageChart/GuageChart';
import LineChartComponent from '../LineChart/LineChart';
import FieldDisplay from './FieldDisplay';
import './NewDashboard.css';
import Navbar from '../Navbar/Navbar';
import { useParams } from 'react-router-dom';
// import SecondaryNavbar from '../SecondaryNavbar/SecondaryNavbar';

const ChannelDashboard = () => {
    const [channelData, setChannelData] = useState({});
    const [currentChannel, setCurrentChannel] = useState({});
    const [fieldData, setFieldData] = useState({});
    const [historicalData, setHistoricalData] = useState({});
    const [isEditing, setIsEditing] = useState(false); // Consolidated edit state
    const [updatedChannelName, setUpdatedChannelName] = useState(''); // For updated channel name
    const [updatedFields, setUpdatedFields] = useState([]);  // For updated field names
    const [newField, setNewField] = useState(''); // New field to be added
    const [fieldToRemove, setFieldToRemove] = useState(''); // Field to be removed
    const { id } = useParams();  // Get the channel ID from the route

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const fieldResponse = await axios.get(`https://xtrans-cloud2.vercel.app/api/channels/${id}/entries/read`);
                if (!fieldResponse.data.entries || fieldResponse.data.entries.length === 0) {
                    console.error('No entries found for this channel');
                    return;
                }
                console.log(fieldResponse);

                const allFields = new Set();
                fieldResponse.data.entries.forEach(entry => {
                    entry.fieldData.forEach(field => allFields.add(field.name));
                });

                const createdFields = Array.from(allFields);
                const latestEntry = createdFields.reduce((acc, fieldName) => {
                    acc[fieldName] = 0;
                    return acc;
                }, {});

                fieldResponse.data.entries.forEach(entry => {
                    entry.fieldData.forEach(field => {
                        latestEntry[field.name] = field.value;
                    });
                });

                setFieldData(latestEntry);

                const historicalDataResponse = fieldResponse.data.entries.reduce((acc, entry) => {
                    createdFields.forEach(fieldName => {
                        acc[fieldName] = acc[fieldName] || [];
                        const field = entry.fieldData.find(f => f.name === fieldName);
                        const value = field ? field.value : (acc[fieldName].length > 0 ? acc[fieldName][acc[fieldName].length - 1].value : 0);
                        acc[fieldName].push({ value, timestamp: entry.timestamp });
                    });
                    return acc;
                }, {});

                setHistoricalData(historicalDataResponse);

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
        getChannelById();
    }, [id]);

    // New function to fetch channels and find by ID
    const getChannelById = async () => {
        try {
            const response = await axios.get('https://xtrans-cloud2.vercel.app/api/auth/channels', {
                headers: { Authorization: `Bearer ${token}` }
            });

            
            const allChannels = response.data.channels;
            
            // Find the specific channel by ID
            const matchedChannel = allChannels.find(channel => channel._id === id);
            console.log(matchedChannel);
            
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

    console.log(currentChannel);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        // Set initial values when opening the modal
        setUpdatedChannelName(channelData.name);
        setUpdatedFields(channelData.fields.map(field => ({ oldName: field, newName: field })));
    };

    const handleChannelUpdate = async () => {
        try {
            const response = await axios.patch(
                `http://localhost:4001/api/auth/channels/${id}`,
                { name: updatedChannelName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChannelData(prevData => ({ ...prevData, name: response.data.channel.name }));
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating channel name:', error);
        }
    };

    const handleFieldUpdate = async () => {
        const confirmUpdate = window.confirm('Are you sure you want to update the field names?');
        if (confirmUpdate) {
            try {
                const updatedFieldData = updatedFields.map(({ oldName, newName }) => ({ oldName, newName }));
                const response = await axios.patch(
                    `http://localhost:4001/api/channels/${id}/fields`,
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

    const handleAddField = async () => {
        if (newField.trim()) {
            try {
                const response = await axios.patch(
                    `https://xtrans-cloud2.vercel.app/api/channels/${id}/add-fields`,
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

    const handleRemoveField = async () => {
        if (fieldToRemove.trim()) {
            try {
                const response = await axios.patch(
                    `https://xtrans-cloud2.vercel.app/api/channels/${id}/remove-fields`,
                    { fields: [fieldToRemove] },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log(response);

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
                window.location.reload();
            } catch (error) {
                console.error('Error removing field:', error);
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
                        </ul>
                        <div className='card-footer'>
                            <button className="btn btn-secondary" onClick={toggleEdit}>
                                Edit
                            </button>
                        </div>
                    </div>

                    <div className="charts-container">
                        {channelData.fields.map((field, index) => (
                            <div className="chart" key={index}>
                                <FieldDisplay name={field} value={fieldData[field]} />
                                <GaugeChartComponent value={fieldData[field]} />
                                <LineChartComponent
                                    data={{
                                        series1: historicalData[field]?.map(entry => entry.value) || [],
                                    }}
                                    timeLabels={historicalData[field]?.map(entry => {
                                        const date = new Date(entry.timestamp);
                                        return date.toLocaleTimeString([], { day:'numeric', month:'numeric' ,hour: '2-digit', minute: '2-digit' });
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
