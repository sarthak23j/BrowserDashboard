import React from 'react';
import Clock from '../Components/Clock';
import SearchBar from '../Components/SearchBar';
import '../Styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Clock />

      <main className="main-content">
        <div className="greeting">
          welcome, <span className="highlight">cr1t.</span>
        </div>
        <SearchBar />
      </main>
    </div>
  );
};

export default Dashboard;
