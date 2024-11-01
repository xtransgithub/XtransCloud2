import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';

const EditModal = ({
    initialChannelName,
    initialFields,
    onUpdateChannel,
    onUpdateFields,
    onAddField,
    onRemoveField,
    onCloseModal,
}) => {
    const validationSchema = Yup.object().shape({
        updatedChannelName: Yup.string().required('Channel name is required'),
        updatedFields: Yup.array().of(
            Yup.object().shape({
                newName: Yup.string().required('Field name cannot be empty')
            })
        ),
        newField: Yup.string().notOneOf(
            initialFields.map((field) => field.oldName),
            'Field name already exists'
        ),
        fieldToRemove: Yup.string().oneOf(
            initialFields.map((field) => field.oldName),
            'Field does not exist'
        )
    });

    return (
        <Formik
            initialValues={{
                updatedChannelName: initialChannelName,
                updatedFields: initialFields.map(field => ({ oldName: field.oldName, newName: field.oldName })),
                newField: '',
                fieldToRemove: ''
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                onUpdateChannel(values.updatedChannelName);
                onUpdateFields(values.updatedFields);
                values.newField && onAddField(values.newField);
                values.fieldToRemove && onRemoveField(values.fieldToRemove);
                onCloseModal();
            }}
        >
            {({ values, errors, touched, handleChange, setFieldValue }) => (
                <Form className="edit-modal">
                    <h2>Edit Channel Details</h2>

                    {/* Channel Name Edit */}
                    <div className="edit-section">
                        <label>Channel Name:</label>
                        <Field name="updatedChannelName" type="text" />
                        {errors.updatedChannelName && touched.updatedChannelName && (
                            <div className="error">{errors.updatedChannelName}</div>
                        )}
                    </div>

                    {/* Field Update */}
                    <div className="edit-section">
                        <h3>Update Field Names</h3>
                        <FieldArray name="updatedFields">
                            {() => (
                                values.updatedFields.map((field, index) => (
                                    <div className="field-edit-row" key={index}>
                                        <label>{field.oldName}</label>
                                        <Field name={`updatedFields[${index}].newName`} type="text" />
                                        {errors.updatedFields?.[index]?.newName && touched.updatedFields?.[index]?.newName && (
                                            <div className="error">{errors.updatedFields[index].newName}</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </FieldArray>
                    </div>

                    {/* Add New Field */}
                    <div className="edit-section">
                        <h3>Add New Field</h3>
                        <Field name="newField" type="text" placeholder="Enter new field name" />
                        {errors.newField && touched.newField && (
                            <div className="error">{errors.newField}</div>
                        )}
                    </div>

                    {/* Remove Field */}
                    <div className="edit-section">
                        <h3>Remove Field</h3>
                        <Field name="fieldToRemove" type="text" placeholder="Enter field name to remove" />
                        {errors.fieldToRemove && touched.fieldToRemove && (
                            <div className="error">{errors.fieldToRemove}</div>
                        )}
                    </div>

                    {/* Form Buttons */}
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={onCloseModal}>
                        Cancel
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default EditModal;
