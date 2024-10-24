import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Images from '../../assets';  // Assuming Images is an object with the logo
// import { FaUserCircle } from 'react-icons/fa';  // FontAwesome or another icon library
import './navbar.css'

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Check if the user is signed in by checking for a token

  const handleLogout = () => {
    // Remove all credentials from local storage on logout
    localStorage.removeItem('token');
    localStorage.removeItem('x-api-key');
    localStorage.removeItem('user');  // If you have other user-related data
    navigate('/signin');  // Redirect to sign-in page after logout
  };

  return (
    <>
      {/* Use Bootstrap classes to make the navbar sticky and styled */}
      <nav className="navbar sticky-top bg-dark">
        <div className="container-fluid">
          {/* Brand/Logo */}
          <a className="navbar-brand" href="/">
            <img 
              src={Images.logo} 
              alt="XTrans Logo" 
              width="30" 
              height="30" 
              className="d-inline-block align-text-top"
            />
            <span className="company"> Xtrans Solutions</span>
          </a>
          
          {/* Navigation Links */}
          <div className="d-flex">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/landing" className="nav-link">Channels</Link>
            <Link to="/documentation" className="nav-link">Documentation</Link>
            <Link to="/support" className="nav-link">Support</Link>
            
            {/* Conditional Rendering based on whether the user is logged in */}
            {token ? (
              <div className="btn-group">
                <button 
                  type="button" 
                  className="btn btn-secondary dropdown-toggle" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                  </svg>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                  <li><Link className="dropdown-item" to="/settings">Account Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item navbardrop" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/signin" className="nav-link">Sign In</Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
