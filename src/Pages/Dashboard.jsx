import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../Components/SearchBar';
import '../Styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="greeting">
        welcome, <span className="highlight">cr1t.</span>
      </div>
      <div className="search-wrapper">
        <SearchBar />
        <button className="btn-creds" onClick={() => navigate('/creds')} aria-label="Credentials">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
          </svg>
        </button>
      </div>
    </>
  );
};

export default Dashboard;
