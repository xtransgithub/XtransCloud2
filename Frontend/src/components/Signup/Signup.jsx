/**
 * SignUp Component
 *
 * The SignUp component allows users to create a new account by providing their details such as name, email, password, 
 * and optional avatar URL. Upon successful registration, the user is redirected to the SignIn page.
 * If an error occurs, an alert modal displays the error message.
 *
 * Props: None
 *
 * State:
 * @state {string} responseMessage - Stores the message returned from the server after submitting the form.
 * @state {boolean} showAlert - Controls the visibility of the alert modal.
 *
 * Validation:
 * - Validates all required fields (first name, last name, email, password, and confirm password).
 * - Ensures that password and confirm password match.
 * - Validates mobile number format (10-digit number).
 * - Avatar URL is optional and must be a valid URL if provided.
 *
 * Functions:
 * @function handleSubmit - Handles form submission. Sends a POST request with user data to the server and processes the response.
 * @function handleCloseAlert - Closes the alert modal when the user clicks to close it.
 *
 * Usage:
 * <SignUp />
 *
 * Styles:
 * Custom styles for the component are defined in `signup.css`.
 */


import React, { useState } from 'react';
import './signup.css';
import Navbar from '../Navbar/Navbar';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../Alert/Alert';
import Images from '../../assets'; 

function SignUp() {
  const [responseMessage, setResponseMessage] = useState('');
  const server = "http://localhost:4001/";
  // const server = "https://xtrans-cloud2.vercel.app/";
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  // Yup validation schema for the new user schema
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .matches(/^\S+$/, 'First Name cannot contain spaces') // no spaces allowed
      .required('First Name is required'),
    lastName: Yup.string()
      .matches(/^\S+$/, 'Last Name cannot contain spaces') // no spaces allowed
      .required('Last Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string()
      .matches(/^\S+$/, 'Password cannot contain spaces') // no spaces allowed in password
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    mobileNumber: Yup.string().matches(/^\d{10}$/, 'Please enter a valid 10-digit mobile number'),
    avatar: Yup.string().url('Please enter a valid URL for the avatar').nullable(), // optional field
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(`${server}api/auth/signup`, values);
      setResponseMessage(response.data.message);
      setShowAlert(true);

      if (response.data.status === 'success') {
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } catch (error) {
      setResponseMessage(error.response ? error.response.data.message : 'Something went wrong');
      setShowAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <>
      <Navbar />
      <div className="signup-page">
        <div className="image-container">
          <img src={Images.wel} alt="Welcome_image" />
        </div>
        <div className="sign-up-container">
          <h2>Sign Up to XTrans Cloud</h2>
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
              mobileNumber: '',
              avatar: '', // optional field
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="sign-up-form">
                <div className="sign-up-form-group">
                  <label htmlFor="firstName">First Name</label>
                  <Field type="text" id="firstName" name="firstName" placeholder="Enter First Name" />
                  <ErrorMessage name="firstName" component="div" className="error-message" />
                </div>
                <div className="sign-up-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <Field type="text" id="lastName" name="lastName" placeholder="Enter Last Name" />
                  <ErrorMessage name="lastName" component="div" className="error-message" />
                </div>  
                <div className="sign-up-form-group">
                  <label htmlFor="email">Email</label>
                  <Field type="email" id="email" name="email" placeholder="Enter Email" />
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>
                <div className="sign-up-form-group">
                  <label htmlFor="password">Password</label>
                  <Field type="password" id="password" name="password" placeholder="Create Password" />
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>
                <div className="sign-up-form-group">
                  <label htmlFor="confirmPassword">Retype Password</label>
                  <Field type="password" id="confirmPassword" name="confirmPassword" placeholder="Retype Password" />
                  <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                </div>
                <div className="sign-up-form-group">
                  <label htmlFor="mobileNumber">Mobile Number</label>
                  <Field type="text" id="mobileNumber" name="mobileNumber" placeholder="Enter Mobile Number" />
                  <ErrorMessage name="mobileNumber" component="div" className="error-message" />
                </div>
                <div className="sign-up-form-group">
                  <label htmlFor="avatar">Avatar URL (optional)</label>
                  <Field type="text" id="avatar" name="avatar" placeholder="Enter Avatar URL" />
                  <ErrorMessage name="avatar" component="div" className="error-message" />
                </div>
                <button type="submit" className="sign-up-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing up...' : 'Sign up'}
                </button>
              </Form>
            )}
          </Formik>
          {showAlert && (
            <AlertModal message={responseMessage} onClose={handleCloseAlert} />
          )}
        </div>
      </div>
    </>
  );
}

export default SignUp;
