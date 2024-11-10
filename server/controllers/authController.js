const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const createError = require('../utils/appError')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.USER_EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
    }
});

exports.signup = async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const apiKey = uuidv4(); // Generate unique UUID for verification

        const newUser = await User.create({
            ...req.body,
            uuid: apiKey,
            password: hashedPassword,
            verified: false // New users are unverified by default
        });

        // Send verification email
        transporter.verify((error, success)=>{
            if(error){
                console.log(error)
            }
            else{
                console.log("message ready to be sent")
                console.log(success)
            }
        })

        const verificationLink = `http://localhost:4001/verify?uuid=${newUser.uuid}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: ${verificationLink}`,
        });

        const token = jwt.sign({ _id: newUser._id , verified: newUser.verified}, 'secretkey123', {
            expiresIn: '1d',
        });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully. Please verify your email.',
            token,
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                mobileNumber: newUser.mobileNumber,
                avatar: newUser.avatar,
                uuid: newUser.uuid,
                verified: newUser.verified
            }
        });

    } catch (error) {
        next(error);
    }
};


exports.login = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user) return next(new createError('User not found', 404));
        
        const isPasswordValid = bcrypt.compare(password, user.password)

        if(!isPasswordValid) return next(new createError('Incorrect password', 401));

        const token = jwt.sign({_id: user._id, verified: user.verified}, 'secretkey123',{
            expiresIn: '1d',
        });

        res.status(200).json({
            status: 'success',
            token , 
            message: 'Loggen in sucessfully',
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                uuid: user.uuid,
                // uid: uniqueId
            }

        });
    }catch(error) {
        next(error);
    }
}

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