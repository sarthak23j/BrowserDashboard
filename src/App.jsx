import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './Layout';
import Dashboard from './Pages/Dashboard';
import Creds from './Pages/Creds';

import './Styles/globalStyles.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/creds" element={<Creds />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
