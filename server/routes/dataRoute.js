const express = require('express');
const router = express.Router();
const Channel = require('../models/channelModel');
const authenticateJWT = require('../middleware/authenticateJWT'); 


// const retrieveEntriesFromChannel = async (channelId, fields, res) => {
//     try {
//         const channel = await Channel.findById(channelId);
//         if (!channel) {
//             return res.status(404).json({ message: 'Channel not found' });
//         }

//         let entries = channel.entries; 

//         if (fields) {
//             const requestedFields = fields.split(',');
//             entries = entries.map(entry => {
//                 const filteredFieldData = entry.fieldData.filter(field =>
//                     requestedFields.includes(field.name)
//                 );
//                 return {
//                     ...entry.toObject(), 
//                     fieldData: filteredFieldData 
//                 };
//             });
//         }

//         res.status(200).json({
//             message: 'Entries retrieved successfully',
//             entries: entries
//         });
//     } catch (error) {
//         console.error('Error retrieving entries:', error);
//         res.status(500).json({ message: 'Failed to retrieve entries', error: error.message });
//     }
// };

const retrieveEntriesFromChannel = async (channelId, fields, res) => {
    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        let entries = channel.entries; 

        if (fields) {
            const requestedFields = fields.split(',');
            entries = entries.map(entry => {
                const filteredFieldData = entry.fieldData.filter(field =>
                    requestedFields.includes(field.name)
                );
                return {
                    ...entry.toObject(), 
                    fieldData: filteredFieldData 
                };
            });
        }

        res.status(200).json({
            message: 'Entries retrieved successfully',
            channelName: channel.name, // Add channel name
            channelDescription: channel.description, // Add channel description
            entries: entries
        });
    } catch (error) {
        console.error('Error retrieving entries:', error);
        res.status(500).json({ message: 'Failed to retrieve entries', error: error.message });
    }
};

router.get('/channels/:channelId/entries/read', async (req, res) => {
    const { channelId } = req.params;
    const { fields } = req.query; 
    await retrieveEntriesFromChannel(channelId, fields, res);
});


const updateFieldNamesInChannel = async (channelId, updatedFields, res) => {
    try {
        // Find the channel by its ID
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        const fieldDataMap = {};
        updatedFields.forEach(({ oldName, newName }) => {
            fieldDataMap[oldName] = newName;
        });

        // Update field names within the entries
        channel.entries = channel.entries.map(entry => {
            entry.fieldData = entry.fieldData.map(field => {
                if (fieldDataMap[field.name]) {
                    field.name = fieldDataMap[field.name]; // Update the field name
                }
                return field;
            });
            return entry;
        });

        // Update field names in the channel's main fields array (if applicable)
        channel.fields = channel.fields.map(field => {
            return fieldDataMap[field] ? fieldDataMap[field] : field;
        });

        // Save the updated channel
        await channel.save();

        res.status(200).json({
            message: 'Field names updated successfully',
            channel: channel
        });
    } catch (error) {
        console.error('Error updating field names:', error);
        res.status(500).json({ message: 'Failed to update field names', error: error.message });
    }
};

// PATCH request to update field names
router.patch('/channels/:channelId/fields', authenticateJWT, async (req, res) => {
    const { channelId } = req.params;
    const updatedFields = req.body.fields; // Expecting [{oldName, newName}] format

    if (!updatedFields || !Array.isArray(updatedFields)) {
        return res.status(400).json({ message: 'Invalid fields data provided' });
    }

    await updateFieldNamesInChannel(channelId, updatedFields, res);
});



const addFieldsToChannel = async (channelId, newFields, res) => {
    try {
        // Find the channel by its ID
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        // Ensure newFields is an array and contains valid field names
        if (!newFields || !Array.isArray(newFields) || newFields.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty fields provided' });
        }

        // Add the new fields to the channel's fields array, avoiding duplicates
        newFields.forEach(field => {
            if (!channel.fields.includes(field)) {
                channel.fields.push(field);
            }
        });

        // Save the updated channel with new fields
        await channel.save();

        res.status(200).json({
            message: 'Fields added successfully',
            channel: channel
        });
    } catch (error) {
        console.error('Error adding fields:', error);
        res.status(500).json({ message: 'Failed to add fields', error: error.message });
    }
};

router.patch('/channels/:channelId/add-fields', authenticateJWT, async (req, res) => {
    const { channelId } = req.params;
    const { fields } = req.body; // Expecting an array of field names to be added

    if (!fields || !Array.isArray(fields)) {
        return res.status(400).json({ message: 'Fields must be provided as an array' });
    }

    await addFieldsToChannel(channelId, fields, res);
});


const removeFieldFromChannel = async (channelId, fieldsToRemove, res) => {
    try {
        // Find the channel by ID
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        // Validate if fieldsToRemove is an array and not empty
        if (!fieldsToRemove || !Array.isArray(fieldsToRemove) || fieldsToRemove.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty fields provided' });
        }

        // Remove the specified fields
        channel.fields = channel.fields.filter(field => !fieldsToRemove.includes(field));

        // Save the updated channel
        await channel.save();

        res.status(200).json({
            message: 'Fields removed successfully',
            channel: channel
        });
    } catch (error) {
        console.error('Error removing fields:', error);
        res.status(500).json({ message: 'Failed to remove fields', error: error.message });
    }
};

// PATCH request to remove fields from a channel
router.patch('/channels/:channelId/remove-fields', authenticateJWT, async (req, res) => {
    const { channelId } = req.params;
    const { fields } = req.body;  // Expecting fields array in the request body

    // Validate that fields is an array
    if (!fields || !Array.isArray(fields)) {
        return res.status(400).json({ message: 'Fields must be provided as an array' });
    }

    // Call helper function to remove fields
    await removeFieldFromChannel(channelId, fields, res);
});

module.exports = router;