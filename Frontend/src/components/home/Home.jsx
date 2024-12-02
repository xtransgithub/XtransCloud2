/**
 * Home Component
 * 
 * This component represents the landing page of the application. It serves as a gateway 
 * for users to explore the platform and offers navigation options for signup and contacting sales.
 * 
 * Features:
 * - Displays a welcoming message and highlights the application's purpose.
 * - Includes navigation buttons for signing up and contacting sales.
 * - Integrates with a shared `Navbar` component for consistent navigation across the application.
 * 
 * Dependencies:
 * - `react-router-dom`: Used for routing within the application (`Link` component).
 * - `Home.css`: Provides styles for the Home page.
 * - `Navbar`: A reusable component for consistent header navigation.
 * 
 * Example Usage:
 * ```jsx
 * import Home from './components/Home/Home';
 * 
 * function App() {
 *   return <Home />;
 * }
 * ```
 * 
 * Routes:
 * - The "Get Started" button navigates users to the `/signup` route.
 * - The "Contact Sales" button is a placeholder for potential future functionality.
 */

import React from 'react';
import './Home.css'; // Import the extracted CSS
import Navbar from '../Navbar/Navbar';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Home = () => {
  return (
    <>
      <Navbar/>
      <div className="Home">
        <main className="Home-main">
          <h1>Empower Your IoT Projects with XTrans</h1>
          <p>
            Seamlessly integrate AI, ML, and Blockchain technologies with our
            powerful IoT platform.
          </p>
          <div className="buttons-home">
            {/* Use Link for navigation */}
            <Link to="/signup">
              <button className="btn-primary-home">Get Started</button>
            </Link>
            <button className="btn-secondary-home">Contact Sales</button>
          </div>
        </main>
      </div>
    </>
  );
};

export default Home;
