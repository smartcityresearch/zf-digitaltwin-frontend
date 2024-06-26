import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import SCRCLOGO from './scrc_logo.png'; // Import SCRC Logo
import ZFLOGO from './zf_logo.png'; // Import ZF Logo

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Digital Twin Collaboration</h1>
      <div className="company-logos">
        <img src={SCRCLOGO} alt="Smart City Logo" /> {/* Use imported SCRC Logo */}
        <img src={ZFLOGO} alt="ZF Logo" /> {/* Use imported ZF Logo */}
      </div>
      <div className="info-about">
        <p>Here you can find information about our digital twin collaboration.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla posuere luctus lorem, sit amet laoreet felis scelerisque vel. Fusce tempor dui sit amet sapien fringilla, eget malesuada purus scelerisque.</p>
      </div>
      <div className="buttons">
        <Link to="/visualization"><button>Visualization</button></Link>
        <Link to="/simulation"><button>Simulation</button></Link>
        <Link to="/actuation"><button>Actuation</button></Link>
      </div>
    </div>
  );
}

export default HomePage;
