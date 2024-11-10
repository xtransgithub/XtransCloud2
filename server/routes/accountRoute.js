const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authenticateJWT = require('../middleware/authenticateJWT'); 

router.get('/me',authenticateJWT,async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId, '-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'User details retrieved successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobileNumber: user.mobileNumber,
                avatar: user.avatar,
                uuid: user.uuid,
                role: user.role,
                verified: false
            }
        });
    } catch (error) {
        next(error);
    }
});


router.patch('/me', authenticateJWT, async (req, res) => {
    const { firstName, lastName } = req.body;

    if (!firstName && !lastName) {
        return res.status(400).json({ message: 'At least one of first name or last name is required' });
    }

    try {
        const userId = req.user._id;

        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User information updated successfully',
            user: {
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                mobileNumber: updatedUser.mobileNumber,
                avatar: updatedUser.avatar,
                uuid: updatedUser.uuid
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;