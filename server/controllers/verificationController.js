const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const createError = require('../utils/appError')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

exports.verifyEmail = async (req, res, next) => {
    try {
        const { uuid } = req.query; // UUID should come from the query parameter

        const user = await User.findOne({ uuid });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification link.' });
        }

        if (user.verified) {
            return res.status(400).json({ message: 'User already verified.' });
        }

        user.verified = true; // Set verified to true
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully.',
        });
    } catch (error) {
        next(error);
    }
};