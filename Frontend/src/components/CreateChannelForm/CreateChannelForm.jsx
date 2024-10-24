import React, { useState } from 'react';
import './CreateChannelForm.css';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../Alert/Alert';

const CreateChannelForm = () => {
    const [showAlert, setShowAlert] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const navigate = useNavigate();
    const server = "https://xtrans-cloud2.vercel.app/";

    // Validation schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string().required('Channel name is required'),
        description: Yup.string().required('Description is required'),
        fields: Yup.array().of(Yup.string().required('Field name is required')).min(1, 'At least one field is required'),
    });

    // Submit handler
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(`${server}api/auth/channels`, values, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 201) {
                localStorage.setItem('x-api-key', response.data.channel.apiKey);
                setResponseMessage('Channel created successfully!');
                setShowAlert(true);
                setTimeout(() => {
                    navigate(`/dashboard/${response.data.channel._id}`);
                }, 2000);
                resetForm(); // Reset the form after successful submission
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
        <div className="unique-create-channel-container">
            <h2>Create a New Channel</h2>
            <Formik
                initialValues={{ name: '', description: '', fields: [''] }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form className="unique-create-channel-form">
                        {/* Channel Name */}
                        <div className="unique-form-group">
                            <label htmlFor="name">Channel Name</label>
                            <Field type="text" id="name" name="name" placeholder="Enter channel name" />
                            <ErrorMessage name="name" component="div" className="unique-error-message" />
                        </div>

                        {/* Channel Description */}
                        <div className="unique-form-group">
                            <label htmlFor="description">Description</label>
                            <Field type="text" id="description" name="description" placeholder="Enter description" />
                            <ErrorMessage name="description" component="div" className="unique-error-message" />
                        </div>

                        {/* Channel Fields */}
                        <div className="unique-form-group">
                            <label>Fields</label>
                            <FieldArray name="fields">
                                {({ insert, remove, push }) => (
                                    <div>
                                        {values.fields.length > 0 && values.fields.map((field, index) => (
                                            <div key={index} className="unique-field-item">
                                                <Field
                                                    type="text"
                                                    name={`fields.${index}`}
                                                    placeholder={`Field ${index + 1}`}
                                                />
                                                <ErrorMessage name={`fields.${index}`} component="div" className="unique-error-message" />
                                                
                                                {/* Remove Field Button */}
                                                {values.fields.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="unique-remove-field-btn"
                                                        onClick={() => remove(index)}
                                                    >
                                                        Remove Field
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {/* Add Field Button */}
                                        <button
                                            type="button"
                                            className="unique-add-field-btn"
                                            onClick={() => push('')}
                                        >
                                            Add Field
                                        </button>
                                    </div>
                                )}
                            </FieldArray>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="unique-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Channel'}
                        </button>
                    </Form>
                )}
            </Formik>

            {/* Alert Modal */}
            {showAlert && <AlertModal message={responseMessage} onClose={handleCloseAlert} />}
        </div>
    );
};

export default CreateChannelForm;
