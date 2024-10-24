const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors') 
const authRouter = require('./routes/authRoute')
const dataRouter = require('./routes/dataRoute')
const accountRouter = require('./routes/accountRoute')
const authenticateJWT = require('./middleware/authenticateJWT'); 
const Channel = require('./models/channelModel');
const csvRouter = require('./routes/csvRoute');

const app = express()
const port = 4001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/auth', accountRouter)
// yaha pr data ka middleware dalna hai

// Apply to routes
app.use('/api/auth', authenticateJWT, authRouter);
// app.use('/api', dataRouter)

//downloading the csvfile
app.use('/api/csv', csvRouter);

const addEntryToChannel = async (channelId, fieldData, res) => {
    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        const validFields = channel.fields; // Get valid fields from channel
        const newEntry = { fieldData: [], timestamp: new Date() };

        // Loop through provided field data and validate against channel fields
        for (const [key, value] of Object.entries(fieldData)) {
            if (validFields.includes(key)) {
                newEntry.fieldData.push({ name: key, value }); // Only add valid fields
            } else {
                console.warn(`Field ${key} is not valid and will be ignored.`);
            }
        }

        if (newEntry.fieldData.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided' });
        }

        // Add the entry to the channel's entries
        channel.entries.push(newEntry);
        await channel.save(); // Save the channel with the new entry

        res.status(201).json({
            message: 'Entry added successfully',
            entry: newEntry
        });
    } catch (error) {
        console.error('Error adding entry:', error);
        res.status(500).json({ message: 'Failed to add entry', error: error.message });
    }
};

app.use('/api', dataRouter);

// Define routes for entries
app.route('/api/channels/:channelId/entries')
    .post(async (req, res) => {
        const { channelId } = req.params;
        const fieldData = req.body; // Expecting data in the request body
        await addEntryToChannel(channelId, fieldData, res);
    })
    .get(async (req, res) => {
        const { channelId } = req.params;
        const fieldData = req.query; // Expecting data in query parameters
        await addEntryToChannel(channelId, fieldData, res);
    });

app.get('/', (req,res)=>{
    res.send('<h1>This is my server home</h1>')
})

mongoose
    .connect('mongodb://127.0.0.1:27017/authentication')
    .then(()=> console.log('Connected to mongodb'))
    .catch((error)=>console.error('Failed to connect : ', error))

// mongoose
//     .connect('mongodb+srv://priyash:1234@cluster0.v3ifnq6.mongodb.net/authentication?retryWrites=true&w=majority&appName=Cluster0')
//     .then(()=> console.log('Connected to mongodb'))
//     .catch((error)=>console.error('Failed to connect : ', error))

app.use((err, req, res, next)=>{
    err.statuCode = err.statuCode || 500
    err.status = err.status || 'error'

    res.status(err.statuCode).json({
        status: err.status,
        message : err.message
    })
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
