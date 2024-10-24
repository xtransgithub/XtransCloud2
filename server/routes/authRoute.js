const express = require ('express')
const authController = require('../controllers/authController')
const Channel = require('../models/channelModel');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authenticateJWT = require('../middleware/authenticateJWT'); 

const router = express.Router();

router.post('/signup', authController.signup)
router.post('/login', authController.login)

// router.post('/channels', async (req, res) => {
//     const { name, description, fields } = req.body;
//     const userId = req.user.id;
//     const apiKey = uuid.v4();

//     const channel = new Channel({ name, description, fields, apiKey, userId });
//     await channel.save();

//     res.status(201).json({ message: 'Channel created successfully', apiKey });
// });


router.post('/channels', authenticateJWT, async (req, res) => {
    const { name, description, fields } = req.body;

    if (!name || !fields) {
        return res.status(400).json({ message: 'Channel name and fields are required' });
    }

    try {
        const userId = req.user._id;
        const apiKey = uuidv4(); 

        // Create the new channel
        const newChannel = new Channel({
            name,
            description,
            fields,
            userId, 
            apiKey
        });

        await newChannel.save();

        res.status(201).json({
            message: 'Channel created successfully',
            channel: newChannel
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create channel', error: error.message });
    }
});


router.get('/channels', authenticateJWT, async (req, res) => {
    try {
        // Retrieve the user ID from the JWT token (set by authenticateJWT)
        const userId = req.user._id;

        // Find all channels that belong to the logged-in user
        const userChannels = await Channel.find({ userId });

        if (!userChannels.length) {
            return res.status(404).json({ message: 'No channels found for this user' });
        }

        res.status(200).json({
            message: 'Channels retrieved successfully',
            channels: userChannels
        });
    } catch (error) {
        console.error('Error retrieving channels:', error);
        res.status(500).json({ message: 'Failed to retrieve channels', error: error.message });
    }
});
  

router.patch('/channels/:channelId', authenticateJWT, async (req, res) => {
    const { channelId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Channel name is required' });
    }

    try {
        const userId = req.user._id;

        // Find the channel by ID and ensure it belongs to the logged-in user
        const channel = await Channel.findOne({ _id: channelId, userId });

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found or you do not have permission to update this channel' });
        }

        // Update the channel name
        channel.name = name;
        await channel.save();

        res.status(200).json({
            message: 'Channel name updated successfully',
            channel
        });
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({ message: 'Failed to update channel name', error: error.message });
    }
});



module.exports = router