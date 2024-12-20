/**
 * LandingPage Component
 * 
 * This component serves as the landing page after user login, providing an overview of the platform
 * and allowing users to view, create, and delete channels. It includes navigation options to 
 * explore channel dashboards and offers dynamic functionality based on user interactions.
 * 
 * Features:
 * - Displays a carousel with default cards for Channels, Dashboard, and Documentation.
 * - Fetches and displays a list of user channels.
 * - Allows users to create a new channel or delete existing channels.
 * - Navigates to the dashboard of a selected channel.
 * - Handles authentication and redirects unauthenticated users to the sign-in page.
 * - Includes a modal for error alerts.
 * 
 * Dependencies:
 * - `axios`: Used for API calls to fetch and manage channels.
 * - `react-router-dom`: Provides navigation via the `useNavigate` hook.
 * - `Navbar`, `CreateChannelForm`, and `AlertModal` components: Reusable UI components.
 * - `LandingPage.css`: Styles specific to the LandingPage component.
 * 
 * Example Usage:
 * ```jsx
 * import LandingPage from './components/LandingPage/LandingPage';
 * 
 * function App() {
 *   return <LandingPage />;
 * }
 * ```
 * 
 * Props:
 * - None
 * 
 * State:
 * - `channels` (array): Stores the list of channels fetched from the server.
 * - `error` (string): Stores error messages for display in an alert modal.
 * - `showChannelCards` (boolean): Toggles between displaying default cards and channel cards.
 * - `showCreateChannelForm` (boolean): Toggles the visibility of the channel creation form.
 * 
 * API Routes:
 * - GET `/api/auth/channels`: Fetches the list of user channels.
 * - DELETE `/api/auth/channels/:channelId`: Deletes a specific channel.
 * 
 * Behavior:
 * - Default cards are displayed initially.
 * - Clicking "Show Channels" fetches and displays the user's channels.
 * - Clicking "Create Channel" displays the channel creation form.
 * - Clicking "Delete Channel" deletes the selected channel after confirmation.
 * - Includes back navigation to return to the default view.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../Alert/Alert';
import './LandingPage.css';
import Navbar from '../Navbar/Navbar';
import axios from 'axios';
import CreateChannelForm from '../CreateChannelForm/CreateChannelForm';

const LandingPage = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);
  const [showChannelCards, setShowChannelCards] = useState(false); // To toggle between default cards and channel cards
  const [showCreateChannelForm, setShowCreateChannelForm] = useState(false);

  // const server = "http://localhost:4001/";
  const server = "https://xtrans-cloud2.vercel.app/";

  // Fetch channels on component mount
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchChannels = async () => {
      const token = localStorage.getItem('token'); // Get token from local storage
      if (!token) {
        navigate('/signin'); // Redirect if no token exists
        return;
      }
      try {
        const response = await axios.get(`${server}api/auth/channels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChannels(response.data.channels); // Assuming the response contains a 'channels' array
      } catch (error) {
        navigate('/create-channel');
        console.error('Error fetching channels:', error);
        setError('An error occurred while fetching channels.');
      }
    };
    if (showChannelCards) {
      fetchChannels(); // Fetch channels only when showChannelCards is true
    }
  }, [navigate, showChannelCards]);

  // Handle channel redirection and backdrop removal
  const handleChannelClick = (channelId) => {
    navigate(`/dashboard/${channelId}`); // Correctly redirect to the channel dashboard
    removeBackdropShowClass(); // Remove backdrop display after redirection
  };

  // Function to remove the "show" class from all elements with the "offcanvas-backdrop" class
  const removeBackdropShowClass = () => {
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    backdrops.forEach((backdrop) => {
      backdrop.style.display = 'none'; // Set display of each backdrop to none
    });
  };
  const handleDeleteChannel = async (channelId) => {
    const token = localStorage.getItem('token'); // Get token from local storage
    try {
      const response = await axios.delete(`${server}api/auth/channels/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out the deleted channel from the channels array
      setChannels(channels.filter(channel => channel._id !== channelId));
      console.log(response.data.message);
    } catch (error) {
      console.error('Error deleting channel:', error);
      setError('An error occurred while deleting the channel.');
    }
  };

  // Default cards before showing channels
  const renderDefaultCards = () => (
    <div className="row">
      <div className="carousel-item active">
        <div className="card card-center" style={{ width: '45rem', height: '25rem' }}>
          <div className="card-body">
            <h3 className="card-title">Channels</h3>
            <p className="card-text">View all channels</p>
            <button className="btn btn-primary" onClick={() => setShowChannelCards(true)}>
              Show Channels
            </button>
          </div>
        </div>
      </div>
      <div className="carousel-item">
        <div className="card card-center" style={{ width: '45rem', height: '25rem' }}>
          <div className="card-body">
            <h3 className="card-title">Dashboard</h3>
            <p className="card-text">View dashboard</p>
            <button className="btn btn-primary" onClick={() => alert('Dashboard coming soon')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
      <div className="carousel-item">
        <div className="card card-center" style={{ width: '45rem', height: '25rem' }}>
          <div className="card-body">
            <h3 className="card-title">Documentation</h3>
            <p className="card-text">Coming soon...</p>
            <button className="btn btn-primary" onClick={() => alert('Documentation coming soon')}>
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Channel cards once "Show Channels" is clicked
  const renderChannelCards = () => (
    <div className="row channelRow">
      {channels.length > 0 ? (
        channels.map((channel) => (
          <div key={channel._id} className="col-md-4 mb-4">
            <div className="card" style={{ width: '18rem' }}>
              <div className="card-body">
                <h5 className="card-title">{channel.name}</h5>
                <h6 className="card-subtitle mb-2 text-body-secondary channelDetails">{channel.description}</h6>
                <p className="card-text">
                  <small className="text-muted">{channel.fields.length} Fields</small>
                </p>
                <a
                  href={`/dashboard/${channel._id}`}
                  className="card-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleChannelClick(channel._id);
                  }}
                >
                  Go to Channel
                </a>
                <a
                  href={'/landing'}
                  className="card-link"
                  onClick={(e) => {
                    e.preventDefault();
                    if(window.confirm('Delete Channel')){
                      handleDeleteChannel(channel._id);
                    }
                    
                  }}
                >
                  Delete Channel
                </a>
                
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No channels found. Create one to get started!</p>
      )}
  
      {/* Add a '+' button inside a card that matches the others */}
      <div className="col-md-4 mb-4">
        <div className="card" style={{ width: '18rem'}}>
          <div className="card-body">
            <h5 className="card-title">Create Channel</h5>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateChannelForm(true)} // Show the create channel form
              style={{ fontSize: '24px', padding: '10px 20px' }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  

  return (
    <>
      <Navbar />
      <div className="landing-page-container">
        <h2 style={{fontsize: 'xxx-large', color: 'aliceblue'}}>Welcome to Xtrans IoT Cloud</h2>
        <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
          </div>
          <div className="carousel-inner">
            {!showChannelCards && !showCreateChannelForm ? renderDefaultCards() : null}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
        {/* {!showChannelCards && !showCreateChannelForm ? renderDefaultCards() : null} */}

        {showChannelCards && !showCreateChannelForm && renderChannelCards()}

        {showCreateChannelForm && <CreateChannelForm />} {/* Render create channel form */}

        {showChannelCards && !showCreateChannelForm && ( // Conditionally render the Back button
          <button className="btn btn-secondary" onClick={() => setShowChannelCards(false)}>
            Back
          </button>
        )}

        {showChannelCards && showCreateChannelForm && ( // Conditionally render the Back button
          <button className="btn btn-secondary" onClick={() => setShowCreateChannelForm(false)}>
            Back
          </button>
        )}

        {error && <AlertModal message={error} onClose={() => setError(null)} />}
      </div>
    </>
  );
};

export default LandingPage;
