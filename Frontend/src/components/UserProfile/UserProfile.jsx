/**
 * UserProfile Component
 *
 * The UserProfile component allows users to view and edit their profile details. It fetches the user's profile data
 * from the server using a token stored in local storage and displays it in a user-friendly manner. Users can update their 
 * first and last names, and upon successful update, they are redirected to the landing page.
 * An alert modal shows a success message upon successful profile update.
 *
 * Props: None
 *
 * State:
 * @state {Object|null} user - Stores the user data fetched from the server.
 * @state {boolean} editMode - Tracks whether the profile is in edit mode or view mode.
 * @state {string} firstName - Stores the first name in the edit form.
 * @state {string} lastName - Stores the last name in the edit form.
 * @state {string} error - Stores any error message encountered during data fetching or updating.
 * @state {string} successMessage - Stores the success message displayed after updating the profile.
 * @state {boolean} showAlert - Controls the visibility of the alert modal showing the success message.
 *
 * useEffect:
 * - Fetches the user profile data when the component is mounted. If no token is found, it redirects to the sign-in page.
 *
 * Functions:
 * @function handleEdit - Enables the edit mode for the user profile form.
 * @function handleSave - Sends the updated user details to the server and processes the response. Redirects to the landing page after a successful update.
 * @function handleCloseAlert - Closes the success alert modal.
 *
 * Usage:
 * <UserProfile />
 *
 * Styles:
 * Custom styles for the component are defined in `UserProfile.css`.
 */


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';  // Assuming you want to style it
import Navbar from '../Navbar/Navbar';
import AlertModal from '../Alert/Alert';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false); // Track if the form is in edit mode
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  // const server = "http://localhost:4001/";
  const server = "https://xtrans-cloud2.vercel.app/";

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/signin'); // Redirect to signin if no token is found
        return;
      }

      try {
        const response = await axios.get(`${server}api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.status === 'success') {
          const userData = response.data.user;
          setUser(userData);
          setFirstName(userData.firstName);
          setLastName(userData.lastName); // Set initial values for the form
        } else {
          setError('Failed to load user details');
        }
      } catch (error) {
        setError('An error occurred while fetching user details');
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleEdit = () => {
    setEditMode(true); // Enable edit mode
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('User is not authenticated.');
      return;
    }

    try {
      const response = await axios.patch(
        `${server}api/auth/me`,
        { firstName, lastName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === 'User information updated successfully') {
        setUser(response.data.user); // Update user details in state
        setSuccessMessage('Profile updated successfully!');
        setShowAlert(true); // Show success alert
        setEditMode(false); // Exit edit mode

        setTimeout(() => {
          navigate('/landing'); // Redirect to /landing after the update
        }, 5000); // 2 seconds delay for user to see the alert
      } else {
        setError('Failed to update user details');
      }
    } catch (error) {
      setError('An error occurred while updating user details');
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="user-profile-container">
        <h1>User Profile</h1>
        {user ? (
          <>
            <div className="profile-section">
              <h2>Personal Information</h2>
              {editMode ? (
                <div className="profile-row">
                  <div className="profile-item">
                    <h4>First Name</h4>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="profile-item">
                    <h4>Last Name</h4>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              ) : (
                <div className="profile-row">
                  <div className="profile-item">
                    <h4>First Name</h4>
                    <p>{user.firstName}</p>
                  </div>
                  <div className="profile-item">
                    <h4>Last Name</h4>
                    <p>{user.lastName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-section">
              <h2>Contact Information</h2>
              <div className="profile-row">
                <div className="profile-item">
                  <h4>Email</h4>
                  <p>{user.email}</p>
                </div>
                <div className="profile-item">
                  <h4>Mobile Number</h4>
                  <p>{user.mobileNumber}</p>
                </div>
              </div>
            </div>

            {user.avatar && (
              <div className="profile-section">
                <h2>Avatar</h2>
                <img src={user.avatar} alt="User Avatar" className="user-avatar" />
              </div>
            )}

            {editMode ? (
              <div className="profile-section">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="profile-section">
                <button className="btn btn-secondary" onClick={handleEdit}>
                  Edit Profile
                </button>
              </div>
            )}

            {showAlert && 
            ( <AlertModal message={successMessage} onClose={handleCloseAlert} />
            )}
          </>
        ) : (
          <p>Loading user profile...</p>
        )}
      </div>
    </>
  );
};

export default UserProfile;
